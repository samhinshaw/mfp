const { parseJSON } = require('../parsers/parser');

function getJsonApi(url, agent, headers) {
  return new Promise((resolve, reject) => {
    parseJSON(url, agent, headers)
      .then(json => {
        resolve(json);
      })
      .catch(err => reject(err));
  });
}

module.exports = getJsonApi;
