const cheerio = require('cheerio');

const checkAccess = require('./check-access');

/**
 *
 *
 * @param {*} username
 * @param {*} startDate
 * @param {*} endDate
 * @param {*} fields
 * @param {*} [agent]
 * @returns
 */
function parsePage(url, agent) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
    };

    agent
      .get(url)
      .set(headers)
      .then(res => {
        // load DOM from HTML file
        const $ = cheerio.load(res.text);

        // Check that we have authorized access
        checkAccess($)
          .then(() => resolve($))
          .catch(err => reject(err));
      })
      .catch(err => {
        reject(err);
      });
  });
}

function parseJSON(url, agent) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
    };

    agent
      .get(url)
      .set(headers)
      .accept('json')
      .then(res => {
        resolve(res.body);
      })
      .catch(err => {
        reject(err);
      });
  });
}

module.exports = { parsePage, parseJSON };
