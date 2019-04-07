const {
  getMainTableColNames,
  getTitleRows,
  getGroupRows,
  getItemStats,
  transformExerciseTable,
  getFooterCells,
} = require('./table-helpers');

function getFood(table, $) {
  const foodStatNames = getMainTableColNames(table, $);

  const mealTitleRows = getTitleRows(table, $);

  const meals = getGroupRows(mealTitleRows, foodStatNames, $);

  // Get totals row except for "TOTAL:"
  const totalsCells = getFooterCells(table);
  const totals = getItemStats(totalsCells, foodStatNames, $);

  return {
    meals,
    totals,
  };
}

function getExercise(table, $) {
  const exerciseStatNames = getMainTableColNames(table, $);
  const exerciseTitleRows = getTitleRows(table, $);
  const exercises = getGroupRows(exerciseTitleRows, exerciseStatNames, $);

  // Get totals row except for "TOTAL:"
  const totalsCells = getFooterCells(table);
  const totals = getItemStats(totalsCells, exerciseStatNames, $);

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
