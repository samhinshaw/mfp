require('chai').should();
const nock = require('nock');

const { fetchSingleDate } = require('../index.js');

describe('fetchSingleDate', () => {
  it('should be a function', () => {
    (typeof fetchSingleDate).should.equal('function');
  });

  it('should contain the correct diary date in the results object', done => {
    nock('https://www.myfitnesspal.com')
      .get('/reports/printable_diary/npmmfp?from=2014-09-13&to=2014-09-13')
      .replyWithFile(200, `${__dirname}/mocks/diary-public.html`)
      .get('/food/diary/npmmfp?date=2014-09-13')
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
      water: 0
    };

    fetchSingleDate('npmmfp', '2014-09-13', 'all', data => {
      data.date.should.equal(expected.date);
      done();
    });
  });

  it('should return an object with all available nutrient data', done => {
    nock('https://www.myfitnesspal.com')
      .get('/reports/printable_diary/npmmfp?from=2014-09-13&to=2014-09-13')
      .replyWithFile(200, `${__dirname}/mocks/diary-public.html`)
      .get('/food/diary/npmmfp?date=2014-09-13')
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
      water: 0
    };

    fetchSingleDate('npmmfp', '2014-09-13', 'all', data => {
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
      sugar: 14
    };

    fetchSingleDate(
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
      sugar: 14
    };

    fetchSingleDate(
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
