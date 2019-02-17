const utils = require('./utils');
const { shorthandFields } = require('./constants');

function getTableContents(table, fields, $) {
  // set results object to store data
  const results = {};

  // define variable for determining columns of fields on MFP page
  const cols = {};

  // find and set column numbers of nutrient fields
  table
    .find('thead')
    .find('tr')
    .find('td')
    .each((index, el) => {
      const element = $(el);
      let fieldName = element.text().toLowerCase();
      fieldName = shorthandFields[fieldName]
        ? shorthandFields[fieldName]
        : fieldName;
      // unless we're at the first field, which just says "Foods", store the
      // index of the column
      if (index !== 0) {
        cols[fieldName] = index;
      }
    });

  // find row in MFP with nutrient totals
  const dataRow = table.find('tfoot').find('tr');

  // store data for each requested field in results
  fields.forEach(field => {
    const col = cols[field] + 1; // because nth-child selector is 1-indexed, not 0-indexed
    const mfpData = dataRow
      .find(`td:nth-child(${col})`)
      .first()
      .text();
    results[field] = utils.convertToNum(mfpData);
  });

  return results;
}

module.exports = getTableContents;
