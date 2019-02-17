# mfp

A third-party API for accessing MyFitnessPal diary data.

[![NPM](http://img.shields.io/npm/v/mfp.svg)](https://www.npmjs.org/package/mfp)
[![Circle CI](https://circleci.com/gh/fitnessforlife/mfp.svg?style=shield&circle-token=e1f56bff19b1519adb77480cbb13550a0d3028e8)](https://circleci.com/gh/fitnessforlife/mfp)
[![Dependency Checker](http://img.shields.io/david/fitnessforlife/mfp.svg)](https://david-dm.org/fitnessforlife/mfp)

# Installation

```
npm install mfp --save
```

# Usage

```js
const { Session } = require('mfp');
```

## `new Session(username)` -> `Session`

Initialize a new session for a given username. Returns a new `Session` object.

## `session.login(password)` -> `Promise<Session>`

(optional) Log in with the username's password. Returns a promise which resolves
to the authenticated `Session` object.

## `session.fetchSingleDate(fields, date)` -> `Promise<Data>`

Asynchronously scrapes nutrient data from a user's food diary on a given date.

- date `String` with format YYYY-MM-DD
- fields `Object` in the following format, which specifies the desired fields:

  ```js
  {
    food: true,
    water: true,
    exercise: true
  }
  ```

  Any missing field will not be returned.

- returns a `Promise`, which resolves to a data object in the Data format.

## `session.fetchDateRange(fields, startDate, endDate)` -> `Promise<Data[]>`

Asynchronously scrapes nutrient data from a user's food diary on a given date.

- dateStart `String` with format YYYY-MM-DD
- dateEnd `String` with format YYYY-MM-DD
- fields `Object` in the following format, which specifies the desired fields:

  ```js
  {
    food: true,
    water: true,
    exercise: true
  }
  ```

- returns a `Promise`, which resolves to a an array of data objects in the Data format.

## `Data` format

```js
{
  date: "2019-01-01",
  food: {
    calories: 2000,
  },
  water: 500,
  exercise: {
    cardio: {
      calories: 102,
      minutes: 	12
    }
  }
}
```

## Examples

### 1. Async/Await; Fetch a Range of Dates

```js
const session = new Session('mfpUsername');

async function getData() {
  try {
    // secure retrieval of password not shown, supply password as you wish
    const authSession = await session.login(securelyObtainedPassword);

    const data = await authSession.fetchDateRange(
      {
        food: true,
        exercise: true,
      },
      '2019-02-01',
      '2019-02-16'
    );

    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

getData();
```

### 2. Promise.then; Fetch a Single Date

```js
const session = new Session('mfpUsername');

// secure retrieval of password not shown, supply password as you wish
session
  .login(securelyObtainedPassword)
  .then(authSession =>
    authSession.fetchSingleDate(
      {
        food: true,
        exercise: true,
        water: true,
      },
      '2019-02-07'
    )
  )
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## mfp.diaryStatusCheck(username, callback)

Asynchronously checks the privacy status of a user's food diary.

- username `String`
- callback `Function`
  - the callback is passed a single argument `status`, which will be a `String`
    with the following possible values: - 'public' - 'private' - 'invalid user'

Example:

```
mfp.diaryStatusCheck('username', function(status) {
  console.log(status);
});
```

## mfp.apiStatusCheck(callback)

Asynchronously checks to see if all the API functions work correctly. They may
cease to work because MyFitnessPal can change the way they present data on their
site at any time.

- callback `Function`
  - the callback is passed a single argument `errors`, which will be an `array`
    containing the following possible `string`s: - 'diaryStatusCheck isn't working correctly for public profiles' - 'diaryStatusCheck isn't working correctly for private profiles' - 'diaryStatusCheck isn't working correctly for invalid usernames' - 'fetchSingleDate with all nutrients isn't working correctly' - 'fetchSingleDate with user-specified nutrients isn't working correctly'

Example:

```
mfp.apiStatusCheck(function(errors) {
  if (errors.length !== 0) {
    errors.forEach(function(error){
      console.log(error);
    });
  } else {
    console.log("There aren't any errors!");
  }
});
```

# Local Dependencies

- request (latest)
- cheerio (latest)
- chai (latest)

# Contributing

**Feel free to contribute with any of the items in the backlog.**

**To Contribute via Issue Notice:**

- Write up a description of the problem
- I will write a fix correspondingly

**To Contribute via Pull Request:**

- Fork the repo

- In lieu of a formal styleguide, take care to maintain the existing coding style.

  - Global "strict mode" is enabled for this project.
  - Commits should be prefixed appropriately:
    - New Features: (feat)
    - Bug Fixes: (fix)
    - Documentation: (doc)
    - Refactoring and Code Cleanup: (refact)

- Add unit tests for any new or changed functionality. Write tests in the appropriate spec file in the `test` directory

- Submit a pull request to master branch

# Development Dependencies

#### Global

- gulp (latest)

#### Local

- mocha (latest)
- coveralls (latest)
- gulp (latest)
- gulp-mocha (latest)
- gulp-istanbul (latest)
- gulp-jshint (latest)
- jshint-stylish (latest)

# Tests

### Run JSHint Linting

```
gulp lint
```

### Run Tests

```
gulp test
```

### Automatically lint and test on source file changes

```
gulp watch
```

# Release History

#### [Currently Using Github Releases since 0.5.5](https://github.com/fitnessforlife/mfp/releases)

- 0.1.0 Initial release, diaryStatusCheck()
- 0.1.1 Update documentation, badges/shields
- 0.2.0 Add fetchSingleDate function
- 0.3.0 Add fetchDateRange function. Add 'date' parameter to fetchSingleDate results.
- 0.4.0 Add apiStatusCheck function
- 0.4.1 Fix Critical Bug: add fetchDateRange function and apiStatusCheck to index.js
- 0.4.2 Fix Critical Bug: add chai as local dependency
- 0.5.0 Multiple Enhancements and Fixes:
  - Refactored fetchSingleDate - 1.6x faster
  - Refactored fetchDateRange - 3.88x faster for 5 days, 6.9x faster for 20 days
  - Removed unsupported nutrient fields from fetchSingleDate and fetchDateRange:
    - 'saturated fat'
    - 'polyunsaturated fat'
    - 'monounsaturated fat'
    - 'trans fat'
    - 'potassium'
    - 'carbohydrates'
    - 'vitamin a'
    - 'vitamin c'
    - 'calcium'
    - 'iron'
  - Fixed occasionally failing apiStatusCheck spec
- 0.5.1 Fix Critical Bug: failing CircleCI build due to file naming issue
- 0.5.2 Update documentation
- 0.5.3 Fix Bug: diaryStatusCheck correctly returns 'invalid user' when hitting 404 page
- 0.5.4 Update dependencies, update tests to use mocha's done() for async tests
- 0.5.5+ ([Using Github Releases](https://github.com/fitnessforlife/mfp/releases))

# Known Issues

# Backlog

- add `exportCSV` function
