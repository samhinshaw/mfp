require('chai').should();
const nock = require('nock');

const { diaryStatusCheck } = require('../index.js');

describe('diaryStatusCheck', () => {
  it('should be a function', () => {
    (typeof diaryStatusCheck).should.equal('function');
  });

  it('should pass a "public" string to a callback when accessing a public diary', done => {
    nock('https://www.myfitnesspal.com')
      .get('/reports/printable_diary/npmmfp')
      .replyWithFile(200, `${__dirname}/mocks/diary-public.html`);

    diaryStatusCheck('npmmfp', status => {
      status.should.equal('public');
      done();
    });
  });

  it('should pass a "private" string to a callback when accessing a private diary', done => {
    nock('https://www.myfitnesspal.com')
      .get('/reports/printable_diary/npmmfp')
      .replyWithFile(200, `${__dirname}/mocks/diary-private.html`);

    diaryStatusCheck('npmmfp', status => {
      status.should.equal('private');
      done();
    });
  });

  it('should pass a "private" string to a callback when accessing a password-protected diary', done => {
    nock('https://www.myfitnesspal.com')
      .get('/reports/printable_diary/npmmfp')
      .replyWithFile(200, `${__dirname}/mocks/diary-password.html`);

    diaryStatusCheck('npmmfp', status => {
      status.should.equal('private');
      done();
    });
  });

  it('should pass an "invalid user" string to a callback when accessing a diary that doesn\'t exist', done => {
    nock('https://www.myfitnesspal.com')
      .get('/reports/printable_diary/asldfjkb3498a')
      .replyWithFile(200, `${__dirname}/mocks/diary-invalid.html`);

    diaryStatusCheck('asldfjkb3498a', status => {
      status.should.equal('invalid user');
      done();
    });
  });

  it('should pass an "invalid user" string to a callback when accessing a page that doesn\'t exist', done => {
    nock('https://www.myfitnesspal.com')
      .get('/reports/printable_diary/https://www.myfitnesspal.com')
      .replyWithFile(200, `${__dirname}/mocks/diary-404-page.html`);

    diaryStatusCheck('https://www.myfitnesspal.com', status => {
      status.should.equal('invalid user');
      done();
    });
  });
});
