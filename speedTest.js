const { fetchSingleDate, fetchDateRange } = require('./index.js');

function logger(type, preTest) {
  if (type === 'single') {
    console.log('Single Date Data: ', `${new Date() - preTest}ms`);
  } else if (type === '5 days') {
    console.log('5 Days Data: ', `${new Date() - preTest}ms`);
  } else if (type === '10 days') {
    console.log('10 Days Data: ', `${new Date() - preTest}ms`);
  } else if (type === '20 days') {
    console.log('20 Days Data: ', `${new Date() - preTest}ms`);
  }
}

function testSingleDay() {
  const preTest = new Date();
  fetchSingleDate('azey47', '2014-09-29', 'all').then(() => {
    logger('single', preTest);
  });
}

function test5Days() {
  const preTest = new Date();
  fetchDateRange('azey47', '2014-09-29', '2014-10-03', 'all').then(() => {
    logger('5 days', preTest);
  });
}

function test10Days() {
  const preTest = new Date();
  fetchDateRange('azey47', '2014-09-29', '2014-10-08', 'all').then(() => {
    logger('10 days', preTest);
  });
}

function test20Days() {
  const preTest = new Date();
  fetchDateRange('azey47', '2014-09-29', '2014-10-18', 'all').then(() => {
    logger('20 days', preTest);
  });
}

testSingleDay();
testSingleDay();
testSingleDay();
testSingleDay();
testSingleDay();

test5Days();
test5Days();
test5Days();
test5Days();
test5Days();

test10Days();
test10Days();
test10Days();
test10Days();
test10Days();

test20Days();
test20Days();
test20Days();
test20Days();
test20Days();
