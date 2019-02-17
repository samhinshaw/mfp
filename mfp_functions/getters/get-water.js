const { parseJSON } = require('../parsers/parser');

function getWater(url, agent, headers) {
  return new Promise((resolve, reject) => {
    parseJSON(url, agent, headers)
      .then(json => {
        resolve(json.item.milliliters);
      })
      .catch(err => reject(err));
  });
}

module.exports = getWater;
