const getTableContents = require('./get-table-contents');
const getRelevantFields = require('./get-relevant-fields');
const { foodFields } = require('./constants');

/**
 *
 *
 * @param {} date
 * @param {*} fields
 * @param {*} $
 * @returns {*}
 */
function getFood(table, fields, $) {
  const relevantFields = getRelevantFields(fields, foodFields);

  // if no fields are left, return early
  if (relevantFields.length < 1) return {};

  // Otherwise, continue on to retrieve the data!
  return getTableContents(table, relevantFields, $);
}

module.exports = getFood;
