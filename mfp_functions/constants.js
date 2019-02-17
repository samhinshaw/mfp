const foodFields = new Set([
  'calories',
  'carbs',
  'fat',
  'protein',
  'cholest',
  'sodium',
  'sugars',
  'fiber',
  'water',
]);

const exerciseFields = new Set([
  'calories',
  'minutes',
  'sets',
  'reps',
  'weight',
]);

const shorthandFields = {
  sugars: 'sugar',
  cholest: 'cholesterol',
};

module.exports = { foodFields, exerciseFields, shorthandFields };
