let gulp = require('gulp'),
    clean = require('gulp-clean'),
    config = require('../config.js');

gulp.task('clean', function () {
    return gulp.src('./build').pipe(clean());
})