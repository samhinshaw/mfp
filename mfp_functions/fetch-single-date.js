const superagent = require('superagent');

const utils = require('./utils');
const { parsePage } = require('./parsers/parser');
const {
  getTableContents,
  formatExerciseObject,
} = require('./getters/get-table-contents');
const getWater = require('./getters/get-water');

// some notes: we use the printable diary for most checks, but not water, which can't be fetched here.
/**
 *
 * @param {*} username The MyFitnessPal username
 * @param {*} date The date to pull entries for
 * @param {*} fields The fields to return
 * @param {*} [session] Optional; an authenticated session returned from session.login()
 * @returns A results object containing the username and the data for the dates requested
 */
function fetchSingleDate(username, date, fields, session = superagent) {
  // Construct the url to get food & exercise
  const printedDiaryUrl = utils.mfpUrl(username, date, date);
  // Use the authenticated agent if it was provided
  const agent = session.agent ? session.agent : superagent;
  return new Promise((resolve, reject) => {
    parsePage(printedDiaryUrl, agent)
      .then(async $ => {
        const diaryEntry = {
          date,
          foodTable: $('#food'),
          exerciseTable: $('#excercise'),
        };

        const result = {
          date,
        };

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

        // get water if it was requested (this requires a different API call)
        if (fields.water) {
          const waterApiUrl = utils.mfpwaterApiUrl(username, date);
          result.water = await getWater(waterApiUrl, agent);
          resolve(result);
        } else {
          resolve(result);
        }
      })
      .catch(err => reject(err));
  });
}

module.exports = fetchSingleDate;
