require('chai').should();

const {
  convertToNum,
  mfpUrl,
  formatDate,
} = require('../mfp_functions/utils.js');

const nonStringTypes = [true, [], {}, null, 1234];

describe('convertToNum', () => {
  it('should be a function', () => {
    (typeof convertToNum).should.equal('function');
  });

  it('should convert strings of numbers to numbers', () => {
    convertToNum('5600').should.equal(5600);
  });

  it('should convert strings of numbers with commas to numbers', () => {
    convertToNum('5,600').should.equal(5600);
    convertToNum('1,000,000').should.equal(1000000);
  });

  it('should convert strings of numbers with units to numbers', () => {
    convertToNum('5,600mg').should.equal(5600);
    convertToNum('70g').should.equal(70);
  });

  it('should throw an error if input is not a string', () => {
    nonStringTypes.forEach(type => {
      convertToNum(type).should.throw(TypeError, "Input type must be 'string'");
    });
  });

  it("should throw an error if input string doesn't contain numbers", () => {
    convertToNum('abcd').should.throw(
      Error,
      'Input string must contain numbers'
    );
  });
});

describe('mfpUrl', () => {
  it('should be a function', () => {
    (typeof mfpUrl).should.equal('function');
  });

  it('should construct a proper url when given a username and date', () => {
    mfpUrl('azey47', '2014-07-08', '2014-07-08').should.equal(
      'https://www.myfitnesspal.com/reports/printable_diary/azey47?from=2014-07-08&to=2014-07-08'
    );
  });

  it('should construct a proper url when only given a username', () => {
    mfpUrl('azey47').should.equal(
      'https://www.myfitnesspal.com/reports/printable_diary/azey47'
    );
  });

  it('should throw an error for non-string username inputs', () => {
    nonStringTypes.forEach(type => {
      mfpUrl(type, '2014-07-08').should.throw(
        TypeError,
        "User ID must be 'string'"
      );
    });
  });

  it('should throw an error for non-string date inputs', () => {
    nonStringTypes.forEach(type => {
      mfpUrl('username', '2014-07-04', type).should.throw(
        TypeError,
        "Date must be 'string'"
      );
      mfpUrl('username', type, '2014-07-04').should.throw(
        TypeError,
        "Date must be 'string'"
      );
    });
  });

  it('should throw an error if date input is not formatted as valid yyyy-mm-dd', () => {
    mfpUrl('username', '2014-99-75', '2014-01-15').should.throw(
      Error,
      "Date must be formatted as valid 'YYYY-MM-DD'"
    );
    mfpUrl('username', '2014-07-04', '2014-07-04-abcd').should.throw(
      Error,
      "Date must be formatted as valid 'YYYY-MM-DD'"
    );
  });
});

describe('formatDate', () => {
  it('should be a function', () => {
    (typeof formatDate).should.equal('function');
  });

  it('should throw an error if passed anything other than a date object', () => {
    formatDate([1, 2, 3]).should.throw(
      Error,
      'argument must be a valid JavaScript Date object'
    );
  });

  it('should format dates correctly', () => {
    formatDate(new Date('August 1, 2015')).should.equal('2015-08-01');
    formatDate(new Date('December 15, 1999')).should.equal('1999-12-15');
  });
});
