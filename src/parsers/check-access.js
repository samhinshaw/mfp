const errors = [
  {
    type: 'No entries.',
    message: 'No diary entries were found for this date range',
    remedy: 'Please try another date.',
  },
  {
    type: 'Unauthorized access.',
    message: 'This user maintains a private diary',
    remedy: 'Please log in first.',
  },
  {
    type: 'Bad credentials.',
    message: 'Incorrect username or password',
    remedy: 'Please check your login credentials.',
  },
  {
    type: 'Rate-limited.',
    message:
      'You have exceeded the maximum number of consecutive failed login attempts',
    remedy: 'Please reset your password or wait one hour and try again.',
  },
];

/**
 * Check the page for various errors
 *
 * @param {*} $ The page you wish to check for errors
 */
function checkAccess($) {
  // Check each specified error type
  errors.forEach(error => {
    if ($(`:contains("${error.message}")`).length > 0) {
      throw new Error(`${error.type}\n${error.message}\n${error.remedy}`);
    }
  });
}
module.exports = checkAccess;
