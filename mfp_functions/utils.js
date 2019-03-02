module.exports = {
  convertToNum(string) {
    if (typeof string === 'number') {
      return string;
    }
    if (typeof string !== 'string') {
      throw new TypeError("Input type must be 'string'");
    }

    // ignore any characters that aren't numbers or commas
    const newString = string.replace(/[^0-9.]+/g, '');

    if (newString.match(/^[-,0-9]+$/) === null) {
      return 0;
    }

    return parseInt(string.split(',').join(''), 10);
  },

  mfpUrl(userId, startDate, endDate) {
    if (typeof userId !== 'string')
      throw new TypeError("User ID must be 'string'");

    if (startDate !== undefined && endDate !== undefined) {
      if (typeof startDate !== 'string')
        throw new TypeError("Date must be 'string'");
      if (typeof endDate !== 'string')
        throw new TypeError("Date must be 'string'");
      if (
        startDate.match(
          /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/
        ) === null
      )
        throw new Error("Date must be formatted as valid 'YYYY-MM-DD'");
      if (
        endDate.match(
          /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/
        ) === null
      )
        throw new Error("Date must be formatted as valid 'YYYY-MM-DD'");
      return `https://www.myfitnesspal.com/reports/printable_diary/${userId}?from=${startDate}&to=${endDate}`;
    }
    // Otherwise no date was specified, and we'll just return today's entry
    return `https://www.myfitnesspal.com/reports/printable_diary/${userId}`;
  },
  mfpWaterApiUrl(userId, date) {
    if (typeof userId !== 'string')
      throw new TypeError("User ID must be 'string'");

    if (date !== undefined) {
      if (typeof date !== 'string')
        throw new TypeError("Date must be 'string'");
      if (
        date.match(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/) ===
        null
      )
        throw new Error("Date must be formatted as valid 'YYYY-MM-DD'");
      return `https://www.myfitnesspal.com/food/water/${userId}?date=${date}`;
    }
    return `https://www.myfitnesspal.com/food/water/${userId}`;
  },
  mfpGoalApiUrl(userId, date) {
    return `https://api.myfitnesspal.com/v2/nutrient-goals?date=2019-03-02`;
  },
  formatDate(dateObject) {
    if (dateObject.constructor !== Date)
      throw new Error('argument must be a valid JavaScript Date object');
    let str = `${dateObject.getFullYear()}-`;

    // add month to str
    if (dateObject.getMonth() + 1 < 10) {
      str += `0${dateObject.getMonth() + 1}`;
    } else {
      str += dateObject.getMonth() + 1;
    }

    str += '-';

    // add day to str
    if (dateObject.getDate() < 10) {
      str += `0${dateObject.getDate()}`;
    } else {
      str += dateObject.getDate();
    }

    return str;
  },
  trimText(text) {
    return (
      text
        // trim extra internal whitespace
        .replace(/\s\s+/g, ' ')
        // trim leading/trailing whitespace
        .trim()
    );
  },
};
