const { parseJSON } = require('../parsers/parser');

function getWater(url, agent) {
  return new Promise((resolve, reject) => {
    parseJSON(url, agent)
      .then(json => {
        resolve(json.item.milliliters);
      })
      .catch(err => reject(err));
  });
}

module.exports = getWater;
