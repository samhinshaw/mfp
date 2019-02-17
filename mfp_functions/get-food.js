const helpers = require('./utils');

/**
 *
 *
 * @param {} date
 * @param {*} fields
 * @param {*} $
 * @returns {}
 */
function getFood(foodTable, fields, $) {
  // set results object to store data
  const results = {};

  // define variable for determining columns of fields on MFP page
  const cols = {};

  // find and set column numbers of nutrient fields
  foodTable
    .find('thead')
    .find('tr')
    .find('td')
    .each((index, el) => {
      const element = $(el);
      let fieldName = element.text().toLowerCase();
      // Fix MFP nutrient field name inconsistency
      fieldName = fieldName === 'sugars' ? 'sugar' : fieldName;
      fieldName = fieldName === 'cholest' ? 'cholesterol' : fieldName;
      // unless we're at the first field, which just says "Foods", store the
      // index of the column
      if (index !== 0) {
        cols[fieldName] = index;
      }
    });

  // find row in MFP with nutrient totals
  const $dataRow = foodTable.find('tfoot').find('tr');

  // store data for each field in results
  Object.keys(cols).forEach(field => {
    const col = cols[field] + 1; // because nth-child selector is 1-indexed, not 0-indexed
    const mfpData = $dataRow
      .find(`td:nth-child(${col})`)
      .first()
      .text();
    results[field] = helpers.convertToNum(mfpData);
  });

  if (fields !== 'all' && Array.isArray(fields)) {
    // create targetFields object to hash user-specified nutrient fields
    const targetFields = {};
    fields.forEach(field => {
      targetFields[field] = true;
    });

    Object.keys(results).forEach(nutrient => {
      if (targetFields[nutrient] === undefined) {
        delete results[nutrient];
      }
    });
  }

  return results;
}

module.exports = getFood;
