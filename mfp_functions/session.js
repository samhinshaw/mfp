const cheerio = require('cheerio');
const superagent = require('superagent');

const utils = require('./utils');
const { parsePage } = require('./parsers/parser');
const {
  getTableContents,
  formatExerciseObject,
} = require('./getters/get-table-contents');
const getWater = require('./getters/get-water');
const checkAccess = require('./parsers/check-access');

/**
 * This session class authenticates a user with their MyFitnessPal credentials,
 * allowing them to make subsequent authenticated requests. Here we use a class
 * instance of a superagent instance, allowing us to retain cookies between
 * requests.
 *
 * @class Session
 */
class Session {
  /**
   *Creates an instance of Session.
   * @memberof Session
   */
  constructor(username) {
    if (typeof username !== 'string') {
      throw new Error('Please supply username as a string.');
    }
    this.username = username;
    this.agent = superagent.agent();
    this.headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
    };
    this.authenticated = false;
  }

  /**
   * Log in to MyFitnessPal.
   *
   * @param {string} password MyFitnessPal password
   * @returns Promise<Session>
   * @memberof Session
   */
  login(password) {
    if (typeof password !== 'string') {
      throw new Error('Please supply password as a string.');
    }
    return new Promise((resolve, reject) => {
      this._getCRSF()
        .then(() => this._inputPassword(this.username, password))
        .then(() => this._getToken())
        .then(() => resolve(this))
        .catch(err => reject(err));
    });
  }

  /**
   * Get the CRSF token on the login page to send with the login request, saving
   * it to the instance.
   *
   * @returns Promise<void>
   * @memberof Session
   */
  _getCRSF() {
    return new Promise((resolve, reject) => {
      this.agent
        .get('https://www.myfitnesspal.com/account/login')
        .set(this.headers)
        .then(res => {
          const $ = cheerio.load(res.text);

          this.utf8Value = $('input[name="utf8"]').val();
          this.authenticityToken = $('input[name="authenticity_token"]').val();
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * POST user, pass & CRSF to the server for login.
   *
   * @param {string} username
   * @param {string} password
   * @returns Promise<void>
   * @memberof Session
   */
  _inputPassword(username, password) {
    return new Promise((resolve, reject) => {
      this.agent
        .post('https://www.myfitnesspal.com/account/login')
        .type('form')
        .send({
          utf8: this.utf8Value,
          authenticity_token: this.authenticityToken,
          username,
          password,
        })
        .then(res => {
          const $ = cheerio.load(res.text);

          checkAccess($)
            .then(resolve())
            .catch(err => reject(err));
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Get the authentication token to send with subsequent requests and update
   * the session headers. Set this.authenticated = true.
   *
   * @returns Promise<void>
   * @memberof Session
   */
  _getToken() {
    return new Promise((resolve, reject) => {
      this.agent
        .get('https://www.myfitnesspal.com/user/auth_token')
        .query({ refresh: true })
        .then(res => {
          if (!res.ok) {
            reject(new Error(`Unable to get Auth Token: Status ${res.status}`));
          } else {
            // update our request headers with the necessary auth info
            this.headers = Object.assign({}, this.headers, {
              Authorization: `${res.body.token_type} ${res.body.access_token}`,
              'mfp-client-id': 'mfp-main-js',
              'mfp-user-id': res.body.user_id,
            });
            // and add a flag signifying we are authenticated
            this.authenticated = true;
            resolve();
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Fetch data for a single date
   *
   * @param {*} fields
   * @param {*} date
   * @returns An object containing the data requested
   * @memberof Session
   */
  fetchSingleDate(fields, date) {
    return new Promise(async (resolve, reject) => {
      this._fetch(fields, date)
        .then(res => {
          // _fetch always returns an array, so we need to spread it
          resolve(...res);
        })
        .catch(err => reject(err));
    });
  }

  /**
   * Fetch data for a range of dates
   *
   * @param {*} fields
   * @param {*} startDate
   * @param {*} endDate
   * @returns An array of objects containing the data requested
   * @memberof Session
   */
  fetchDateRange(fields, startDate, endDate) {
    return new Promise(async (resolve, reject) => {
      this._fetch(fields, startDate, endDate)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  /**
   * Get data for specified dates
   *
   * @param {*} fields The fields you wish to retrieve
   * @param {*} startDate The date you wish to retrieve, or the start of the
   * range of dates you wish to retrieve
   * @param {*} [endDate=startDate] (optional) The end date of the range you
   * wish to retrieve. If left out, will only fetch data for the startDate.
   * @returns Promise<Data> A promise which will resolve to the requested Data
   * object.
   * @memberof Session
   */
  _fetch(fields, startDate, endDate = startDate) {
    // Construct the url to get food & exercise
    const printedDiaryUrl = utils.mfpUrl(this.username, startDate, endDate);
    // Use the authenticated agent if we are logged in
    const agent = this.authenticated ? this.agent : superagent;

    return new Promise((resolve, reject) => {
      parsePage(printedDiaryUrl, agent)
        .then(async $ => {
          const diaryEntries = [];

          // For each diary entry encountered, add the date formatted as
          // YYYY-MM-DD and the food & exercise tables the entry array.
          $('.main-title-2').each((index, el) => {
            const element = $(el);
            diaryEntries.push({
              date: utils.formatDate(new Date(element.text())),
              foodTable: element.next('#food'),
              exerciseTable: element.next('#excercise'),
            });
          });

          // iterate through all dates and push data into a final results object
          const results = await diaryEntries.map(async diaryEntry => {
            const result = {};
            // get food if it was requested
            if (fields.food && diaryEntry.foodTable.length) {
              result.food = getTableContents(diaryEntry.foodTable, $);
            }

            // get exercise if it was requested
            if (fields.exercise && diaryEntry.exerciseTable.length) {
              result.exercise = formatExerciseObject(
                getTableContents(diaryEntry.exerciseTable, $)
              );
            }
            if (fields.water) {
              const waterApiUrl = utils.mfpwaterApiUrl(
                this.username,
                diaryEntry.date
              );
              result.water = await getWater(waterApiUrl, agent);
            }

            return result;
          });

          resolve(Promise.all(results));
        })
        .catch(err => reject(err));
    });
  }
}

module.exports = Session;
