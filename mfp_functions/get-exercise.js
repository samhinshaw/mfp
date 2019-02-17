const helpers = require('./utils');

/**
 *
 *
 * @param {} date
 * @param {*} fields
 * @param {*} $
 * @returns {}
 */
function getExercise(entry, fields, $) {
  return new Promise(async (resolve, reject) => {
    try {
      // set results object to store data
      const results = {};

      // define variable for determining columns of fields on MFP page
      const cols = {};

      // find and set column numbers of nutrient fields
      entry.$foodTable
        .find('thead')
        .find('tr')
        .find('td')
        .each((index, element) => {
          const $element = $(element);
          let fieldName = $element.text().toLowerCase();
          // Fix MFP nutrient field name inconsistency
          fieldName = fieldName === 'sugars' ? 'sugar' : fieldName;
          fieldName = fieldName === 'cholest' ? 'cholesterol' : fieldName;
          // ignore first field, which just says "Foods"
          if (index !== 0) {
            cols[fieldName] = index;
          }
        });

      // find row in MFP with nutrient totals
      const $dataRow = entry.$foodTable.find('tfoot').find('tr');

      // store data for each field in results
      cols.forEach(field => {
        const col = cols[field] + 1; // because nth-child selector is 1-indexed, not 0-indexed
        const mfpData = $dataRow
          .find(`td:nth-child(${col})`)
          .first()
          .text();
        results[field] = helpers.convertToNum(mfpData);
      });

      resolve(results);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = getExercise;
