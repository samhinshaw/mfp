const getTableContents = require('./get-table-contents');
const getRelevantFields = require('./get-relevant-fields');
const { exerciseFields } = require('./constants');

/**
 *
 *
 * @param {} date
 * @param {*} fields
 * @param {*} $
 * @returns {}
 */
function getExercise(table, fields, $) {
  // Otherwise, continue on to retrieve the data!
  return getTableContents(table, relevantFields, $);
}

module.exports = getExercise;
