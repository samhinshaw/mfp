const { foodFields, exerciseFields } = require('./constants');

function getRelevantFields(requestedFields, possibleFields) {
  let relevantFields;
  let possibleFieldsSet;
  if (!(possibleFields instanceof Set)) {
    possibleFieldsSet = new Set(...possibleFields);
  }
  if (requestedFields === 'all') {
    relevantFields = requestedFields;
  } else if (Array.isArray(requestedFields)) {
    relevantFields = requestedFields.filter(field =>
      possibleFieldsSet.has(field)
    );
  } else if (typeof fields === 'string') {
    relevantFields = possibleFieldsSet.has(requestedFields)
      ? requestedFields
      : [];
  } else {
    // Otherwise, an unexpected value was supplied
    throw new Error('An unexpected value was supplied as fields.');
  }
  return relevantFields;
}

function checkShouldGetFood(fields) {
  const relevantFields = getRelevantFields(fields, foodFields);
  if (relevantFields.length < 1) {
    return false;
  }
  return true;
}

function checkShouldGetExercise(fields) {
  const relevantFields = getRelevantFields(fields, foodFields);
  if (relevantFields.length < 1) {
    return false;
  }
  return true;
}

function checkShouldGetWater(fields) {
  if (fields === 'all' || fields.includes('water')) {
    return true;
  }
  return false;
}

module.exports = {
  getRelevantFields,
  checkShouldGetFood,
  checkShouldGetExercise,
  checkShouldGetWater,
};
