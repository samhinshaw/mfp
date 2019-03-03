const request = require('request');
const cheerio = require('cheerio');
const helpers = require('./utils');

function diaryStatusCheck(username, callback) {
  const url = helpers.getReportUrl(username);

  const options = {
    url,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
    },
  };

  request(options, (error, response, body) => {
    if (error) throw error;

    const $ = cheerio.load(body);

    if (body === 'Invalid username' || body === 'Invalid username\n') {
      callback('invalid user');
    } else if (
      $('#main')
        .find('#settings')
        .find('h1')
        .text() === 'This Username is Invalid'
    ) {
      callback('invalid user');
    } else if ($('h1').text() === 'Page not found') {
      callback('invalid user');
    } else if (
      $('#main')
        .find('#settings')
        .find('h1')
        .text() === 'This Diary is Private'
    ) {
      callback('private');
    } else if (
      $('#main')
        .find('#settings')
        .find('h1')
        .text() === 'Password Required'
    ) {
      callback('private');
    } else {
      callback('public');
    }
  });
}

module.exports = diaryStatusCheck;
