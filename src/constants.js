// All the possible fields within the food diary entry
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

const cardioFields = new Set(['calories', 'minutes']);

const strengthFields = new Set(['sets', 'reps', 'weight']);

// All the possible fields within the exercise diary entry
const exerciseFields = new Set([...cardioFields, ...strengthFields]);

// Fields which the printable diary entry prints shorthand
const shorthandFields = {
  sugars: 'sugar',
  cholest: 'cholesterol',
};

module.exports = { foodFields, exerciseFields, shorthandFields };
