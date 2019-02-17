const superagent = require('superagent');

const getFood = require('./get-food');
const getWater = require('./get-water');
const { parsePage } = require('./parser');
const utils = require('./utils');

/**
 *
 *
 * @param {*} username The MyFitnessPal username
 * @param {*} startDate The first date to pull data for
 * @param {*} endDate The last date to pull entries for
 * @param {*} fields The fields to return
 * @param {*} [session] Optional; an authenticated session returned from session.login()
 * @returns A results object containing the username and the data for the dates requested
 */
function fetchDateRange(username, startDate, endDate, fields, session) {
  // Construct the url to get food & exercise
  const foodURL = utils.mfpUrl(username, startDate, endDate);
  // Use the authenticated agent if it was provided
  const agent = session.agent ? session.agent : superagent;
  // Then fetch the requested data
  return new Promise((resolve, reject) => {
    parsePage(foodURL, agent)
      .then(async $ => {
        const diaryEntries = [];

        // For each diary entry encountered, add the date formatted as
        // YYYY-MM-DD and the food & exercise tables the entry array.
        $('.main-title-2').each((index, element) => {
          const $element = $(element);
          diaryEntries.push({
            date: utils.formatDate(new Date($element.text())),
            $foodTable: $element.next('#food'),
            $exerciseTable: $('#excercise'),
          });
        });

        // iterate through all dates and push data into a final results object
        const results = await diaryEntries.map(async entry => {
          const result = await getFood(entry.$foodTable, fields, $);
          result.date = entry.date;
          // get water if it was requested (this requires a different API call)
          if (fields === 'all' || fields.includes('water')) {
            const waterURL = utils.mfpWaterUrl(username, entry.date);
            result.water = await getWater(waterURL, agent);
          }
          return result;
        });

        resolve(Promise.all(results));
      })
      .catch(err => {
        reject(err);
      });
  });
}

module.exports = fetchDateRange;
