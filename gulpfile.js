const gulp = require("gulp");
const jshint = require("gulp-jshint");
const stylish = require("jshint-stylish");
const mocha = require("gulp-mocha");
const istanbul = require("gulp-istanbul");

// var coveralls = require('gulp-coveralls');

gulp.task("lint", cb => {
  gulp
    .src(["./!(coverage|node_modules)/**/*.js"])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task("test", cb => {
  gulp
    .src(["./mfp_functions/**/*.js", "./index.js"])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on("finish", () => {
      gulp
        .src(["./test/**/*.js"])
        .pipe(mocha({ reporter: "spec" }))
        .pipe(istanbul.writeReports())
        .on("end", cb);
    });
});

// appears misconfigured, removed
/*
gulp.task('coveralls', function(cb){
  return gulp.src('./coverage/lcov.info')
  .pipe(coveralls());
});
*/

gulp.task("watch", () => {
  gulp.watch("./mfp_functions/**", ["lint", "test"]);
  gulp.watch("./test/**", ["lint", "test"]);
});

gulp.task("default", ["watch"]);
