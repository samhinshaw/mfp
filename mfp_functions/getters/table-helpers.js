const { shorthandFields } = require('../constants');
const utils = require('../utils');

// define variable for determining columns of fields on MFP page
function getMainTableColNames(table, $) {
  return table
    .find('thead')
    .find('tr')
    .find('td.first')
    .nextAll()
    .get()
    .map(cell => {
      let fieldName = $(cell)
        .text()
        .toLowerCase();
      fieldName = shorthandFields[fieldName]
        ? shorthandFields[fieldName]
        : fieldName;
      return fieldName;
    });
}

function getTitleRows(table) {
  return table
    .find('tbody')
    .find('tr.title')
    .get();
}

function getGroupRows(titleRows, cols, $) {
  return titleRows.map(titleRow => {
    const groupNames = $(titleRow)
      .find('td')
      .get()
      .map(cell => $(cell).text());
    // There should only be one td within this row. If there's more, something
    // went wrong with parsing
    const groupName = groupNames[0];

    // Next, Get all the rows of the meal/exercise type up until the next meal/exercise type
    const items = $(titleRow)
      .nextUntil('.title')
      .get()
      .map(groupRow => {
        const item = {};
        const itemNameCell = $(groupRow)
          .find('td')
          .first();
        item.name = utils.trimText(itemNameCell.text());
        itemNameCell
          .nextAll()
          .get()
          .forEach((stat, index) => {
            // Only add the cell if it's truthy
            const statText = utils.trimText($(stat).text());
            if (statText) {
              item[cols[index]] = utils.convertToNum(statText);
            }
          });
        return item;
      });
    return { name: groupName, items };
  });
}

/**
 * We want to treat the exercise table slightly differently, since the "group"
 * names are known: cardiovascular & strength training
 *
 */
function transformExerciseTable(exerciseObject) {
  const desired = {
    cardiovascular: {},
    strength: {},
    // preserve totals
    totals: exerciseObject.totals,
  };
  exerciseObject.exercises.forEach(group => {
    if (group.name === 'Cardiovascular') {
      desired.cardiovascular.exercises = group.items;
    } else if (group.name === 'Strength Training') {
      desired.strength.exercises = group.items;
    }
  });
  return desired;
}

module.exports = {
  getMainTableColNames,
  getTitleRows,
  getGroupRows,
  transformExerciseTable,
};
