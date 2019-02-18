const utils = require('../utils');
const {
  getMainTableColNames,
  getTitleRows,
  getGroupRows,
  transformExerciseTable,
} = require('./table-helpers');

function getFood(table, $) {
  const foodCols = getMainTableColNames(table, $);

  const mealTitleRows = getTitleRows(table, $);

  const meals = getGroupRows(mealTitleRows, foodCols, $);

  // Get totals row except for "TOTAL:"
  const totals = {};
  table
    .find('tfoot')
    .find('tr')
    .find('td.first')
    .nextAll()
    .get()
    .forEach((stat, index) => {
      // Only add the cell if it's truthy
      const statText = utils.trimText($(stat).text());
      if (statText) {
        totals[foodCols[index]] = utils.convertToNum(statText);
      }
    });

  return {
    meals,
    totals,
  };
}

//! Note: THIS MUST BE HANDLED DIFFERENTLY THAN THE FOOD TABLE
//! There is some funky stuff going on with the exercise table and colspans on
//! the <td> elements which are messing up our indexing to the column header
function getExercise(table, $) {
  const exerciseCols = getMainTableColNames(table, $);
  const exerciseTitleRows = getTitleRows(table, $);
  const exercises = getGroupRows(exerciseTitleRows, exerciseCols, $);

  // Get totals row except for "TOTAL:"
  const totals = {};
  table
    .find('tfoot')
    .find('tr')
    .find('td.first')
    .nextAll()
    .get()
    .forEach((stat, index) => {
      // Only add the cell if it's truthy
      const statText = utils.trimText($(stat).text());
      if (statText) {
        totals[exerciseCols[index]] = utils.convertToNum(statText);
      }
    });

  // Transform from the abstract "named groups" format that we use for the
  // meals to the specific format we can use for exercises, since we already
  // know what the two groups will be named
  return transformExerciseTable({
    exercises,
    totals,
  });
}

function formatExerciseTotals(exercise) {
  return {
    cardio: {
      calories: exercise.calories,
      minutes: exercise.minutes,
    },
    strength: {
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
    },
  };
}

module.exports = { getFood, getExercise, formatExerciseTotals };
