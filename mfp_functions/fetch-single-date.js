const superagent = require('superagent');

const utils = require('./utils');
const { parsePage } = require('./parser');
const getFood = require('./get-food');
const getExercise = require('./get-exercise');
const getWater = require('./get-water');

const {
  checkShouldGetFood,
  checkShouldGetExercise,
  checkShouldGetWater,
} = require('./check-relevant-fields');

// some notes: we use the printable diary for most checks, but not water, which can't be fetched here.
/**
 *
 * @param {*} username The MyFitnessPal username
 * @param {*} date The date to pull entries for
 * @param {*} fields The fields to return
 * @param {*} [session] Optional; an authenticated session returned from session.login()
 * @returns A results object containing the username and the data for the dates requested
 */
function fetchSingleDate(username, date, fields, session) {
  // Construct the url to get food & exercise
  const printedDiaryUrl = utils.mfpUrl(username, date, date);
  // Use the authenticated agent if it was provided
  const agent = session.agent ? session.agent : superagent;
  return new Promise((resolve, reject) => {
    parsePage(printedDiaryUrl, agent)
      .then(async $ => {
        // This is done to keep the getFood API consistent between
        // fetchSingleDate and fetchDateRange
        const diaryEntry = {
          date,
          foodTable: $('#food'),
          exerciseTable: $('#excercise'),
        };

        const results = {
          date,
        };

        // get food if it was requested
        if (checkShouldGetFood(fields)) {
          results.food = getFood(diaryEntry.foodTable, fields, $);
        }

        // get exercise if it was requested
        if (checkShouldGetExercise(fields)) {
          results.exercise = getExercise(diaryEntry.exerciseTable, fields, $);
        }

        // get water if it was requested (this requires a different API call)
        if (checkShouldGetWater(fields)) {
          const waterApiUrl = utils.mfpwaterApiUrl(username, date);
          results.water = await getWater(waterApiUrl, agent);
          resolve(results);
        } else {
          resolve(results);
        }
      })
      .catch(err => reject(err));
  });
}

module.exports = fetchSingleDate;
