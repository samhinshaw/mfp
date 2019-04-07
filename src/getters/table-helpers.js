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

function getFooterCells(table) {
  return table
    .find('tfoot')
    .find('tr')
    .find('td.first')
    .nextAll()
    .get();
}

function getItemStats(listOfCells, statNames, $) {
  let indexAccommodatingForColspans = 0;
  const item = {};
  listOfCells.forEach(stat => {
    // Only add the cell if it's truthy
    const statText = utils.trimText($(stat).text());
    if (statText) {
      const statName = statNames[indexAccommodatingForColspans];
      item[statName] = utils.convertToNum(statText);
    }
    // Also, accommodate for colspans so we can skip the appropriate number of
    // cells corresponding to the header.
    //* Note: This assumes there were no colspans in the header.
    const colspan = $(stat).attr('colspan');
    if (colspan) {
      indexAccommodatingForColspans += parseInt(colspan, 10);
    } else {
      indexAccommodatingForColspans += 1;
    }
  });
  return item;
}

function getGroupRows(titleRows, statNames, $) {
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
        const itemNameCell = $(groupRow)
          .find('td')
          .first();

        const statCells = itemNameCell.nextAll().get();

        const item = getItemStats(statCells, statNames, $);
        item.name = utils.trimText(itemNameCell.text());

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
  getItemStats,
  transformExerciseTable,
  getFooterCells,
};
