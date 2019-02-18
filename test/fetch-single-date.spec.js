require('chai').should();
const nock = require('nock');

const { Session } = require('../index.js');
const allExpectedFields = require('./expectations/all-possible-fields.json');

describe('fetchSingleDate', () => {
  const session = new Session('user');
  it('should be a function', () => {
    (typeof fetchSingleDate).should.equal('function');
  });

  it('should contain the correct diary date in the results object', done => {
    nock('https://www.myfitnesspal.com')
      .get('/reports/printable_diary/user?from=2014-09-14&to=2014-09-13')
      .replyWithFile(200, `${__dirname}/mocks/diary-public.html`)
      .get('/food/diary/npmmfp?date=2018-02-14')
      .replyWithFile(200, `${__dirname}/mocks/diary2-public.html`);

    const expected = {
      date: '2014-09-13',
      calories: 2078,
      carbs: 98,
      fat: 119,
      protein: 153,
      cholesterol: 1123,
      sodium: 3031,
      sugar: 14,
      fiber: 5,
      water: 0,
    };

    session
      .fetchSingleDate({ exercise: true, food: true }, '2019-02-14')
      .then(data => {
        data.date.should.equal(expected.date);
        done();
      });
  });

  it.only('should return an object with all available nutrient data', done => {
    nock('https://www.myfitnesspal.com')
      .get('/reports/printable_diary/user?from=2019-02-14&to=2019-02-14')
      .replyWithFile(200, `${__dirname}/mocks/diary-all-entry-types.html`)
      .get('/food/diary/user?date=2019-02-14')
      .replyWithFile(200, `${__dirname}/mocks/diary-all-entry-types.html`);

    const expected = allExpectedFields;

    session
      .fetchSingleDate({ exercise: true, food: true }, '2019-02-14')
      .then(data => {
        console.log(JSON.stringify(data, null, 1));
        data.should.deep.equal(expected);
        done();
      });
  });

  it('should return an object with only user specified nutrient data', done => {
    nock('https://www.myfitnesspal.com')
      .get('/reports/printable_diary/npmmfp?from=2014-09-13&to=2014-09-13')
      .replyWithFile(200, `${__dirname}/mocks/diary-public.html`);

    const expected = {
      date: '2014-09-13',
      calories: 2078,
      fat: 119,
      cholesterol: 1123,
      sugar: 14,
    };

    session.fetchSingleDate(
      'npmmfp',
      '2014-09-13',
      ['calories', 'fat', 'cholesterol', 'sugar'],
      data => {
        data.should.deep.equal(expected);
        done();
      }
    );
  });

  it('should ignore invalid nutrient fields', done => {
    nock('https://www.myfitnesspal.com')
      .get('/reports/printable_diary/npmmfp?from=2014-09-13&to=2014-09-13')
      .replyWithFile(200, `${__dirname}/mocks/diary-public.html`);

    const expected = {
      date: '2014-09-13',
      calories: 2078,
      fat: 119,
      cholesterol: 1123,
      sugar: 14,
    };

    session.fetchSingleDate(
      'npmmfp',
      '2014-09-13',
      ['calories', 'fat', 'cholesterol', 'sugar', 'wrongnutrientfield'],
      data => {
        data.should.deep.equal(expected);
        done();
      }
    );
  });
});
