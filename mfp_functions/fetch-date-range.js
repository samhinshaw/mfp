const superagent = require('superagent');

const getWater = require('./get-water');
const { parsePage } = require('./parser');
const {
  getTableContents,
  formatExerciseObject,
} = require('./get-table-contents');
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
function fetchDateRange(
  username,
  startDate,
  endDate,
  fields,
  session = superagent
) {
  // Construct the url to get food & exercise
  const printedDiaryUrl = utils.mfpUrl(username, startDate, endDate);
  // Use the authenticated agent if it was provided
  const agent = session.agent ? session.agent : superagent;
  // Then fetch the requested data
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
            const waterApiUrl = utils.mfpwaterApiUrl(username, diaryEntry.date);
            result.water = await getWater(waterApiUrl, agent);
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
