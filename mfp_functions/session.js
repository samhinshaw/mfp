const cheerio = require('cheerio');
const superagent = require('superagent');

const utils = require('./utils');
const { parsePage } = require('./parsers/parser');
const { getFood, getExercise } = require('./getters/get-table-contents');
const getJsonApi = require('./getters/get-json-api');
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
            this.userId = res.body.user_id;
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

  async fetchGoals(date) {
    const goalApiUrl = utils.getGoalApiUrl(date);
    const goals = await getJsonApi(goalApiUrl, this.agent, this.headers);
    return goals.items[0].default_goal;
  }

  async fetchMeasurements() {
    const measurementApiUrl = utils.getMeasurementApiUrl();
    const measurements = await getJsonApi(
      measurementApiUrl,
      this.agent,
      this.headers
    );
    return measurements.items[0];
  }

  async fetchDiary(date) {
    const diaryApiUrl = utils.getDiaryApiUrl(date);
    const diary = await getJsonApi(diaryApiUrl, this.agent, this.headers);
    return diary.items[0];
  }

  async fetchWater(date) {
    const waterApiUrl = utils.getWaterApiUrl(this.username, date);
    const water = await getJsonApi(waterApiUrl, this.agent, this.headers);
    return water.item.milliliters;
  }

  async fetchAccountData() {
    const accountApiUrl = utils.getAccountApiUrl(this.userId);
    const accountInfo = await getJsonApi(
      accountApiUrl,
      this.agent,
      this.headers
    );
    return accountInfo;
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
    const [validStartDate, validEndDate] = utils.validateDateOrder(
      startDate,
      endDate
    );
    return new Promise(async (resolve, reject) => {
      this._fetch(fields, validStartDate, validEndDate)
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
  async _fetch(fields, startDate, endDate = startDate) {
    const [$, diaryEntries] = await this._getDiaryTables(
      fields,
      startDate,
      endDate
    );

    // iterate through all dates and push data into a final results object
    const results = Object.entries(diaryEntries).map(async ([date, entry]) => {
      const result = {
        date,
      };

      if ($ && fields.food && entry.food.wasRetrieved && !entry.food.isEmpty) {
        result.food = getFood(entry.food.table, $);
      }

      if (
        $ &&
        fields.exercise &&
        entry.exercise.wasRetrieved &&
        !entry.exercise.isEmpty
      ) {
        result.exercise = getExercise(entry.exercise.table, $);
      }

      if (fields.water) {
        result.water = this.fetchWater(date);
      }

      return result;
    });

    return Promise.all(results);
  }

  async _getDiaryTables(fields, startDate, endDate) {
    const diaryEntries = {};

    utils
      .getDatesBetween(new Date(startDate), new Date(endDate))
      // format from date objects to strings as an object
      .forEach(date => {
        const formattedDate = date.toISOString().slice(0, 10);
        diaryEntries[formattedDate] = {
          food: {
            wasRetrieved: false,
            isEmpty: undefined,
            table: undefined,
          },
          exercise: {
            wasRetrieved: false,
            isEmpty: undefined,
            table: undefined,
          },
        };
      });

    // Construct the url to get food & exercise
    const printedDiaryUrl = utils.mfpUrl(this.username, startDate, endDate);

    if (fields.food || fields.exercise) {
      const $ = await parsePage(printedDiaryUrl, this.agent, this.headers);

      // For each diary entry encountered, add the date formatted as
      // YYYY-MM-DD and the food & exercise tables the entry array.
      $('.main-title-2').each((index, el) => {
        const dateHeader = $(el);
        const foodTable = dateHeader.next('#food');
        // Next only gets the very next sibling, so we must get the exercise
        // table from the foodTable, not from the date header
        const exerciseTable = foodTable.next('#excercise');

        const formattedDate = utils.formatDate(new Date(dateHeader.text()));

        diaryEntries[formattedDate] = {
          food: {
            wasRetrieved: true,
            isEmpty: !foodTable.length,
            table: foodTable,
          },
          exercise: {
            wasRetrieved: true,
            isEmpty: !foodTable.length,
            table: exerciseTable,
          },
        };
      });

      return [$, diaryEntries];
    }
    return [undefined, diaryEntries];
  }
}

module.exports = Session;
