let gulp = require('gulp'),
    config = require('../config.js');

let path = '';

gulp.task('copy', function () {
    return gulp.src([path + '/**/*.*'])
        .pipe(gulp.dest(config.buildPath + path));
});