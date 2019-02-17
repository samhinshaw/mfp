const diaryStatusCheck = require('./mfp_functions/diary-status-check.js');
const fetchSingleDate = require('./mfp_functions/fetch-single-date.js');
const fetchDateRange = require('./mfp_functions/fetch-date-range.js');
const apiStatusCheck = require('./mfp_functions/api-status-check.js');

module.exports = {
  diaryStatusCheck,
  fetchSingleDate,
  fetchDateRange,
  apiStatusCheck,
};
