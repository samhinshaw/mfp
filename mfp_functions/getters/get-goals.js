const { parseJSON } = require('../parsers/parser');

// https://api.myfitnesspal.com/v2/nutrient-goals?date=2019-03-02

function getGoals(url, agent, headers) {
  return new Promise((resolve, reject) => {
    parseJSON(url, agent, headers)
      .then(json => {
        resolve(json);
      })
      .catch(err => reject(err));
  });
}

module.exports = getGoals;
