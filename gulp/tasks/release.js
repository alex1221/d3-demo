let gulp = require('gulp'),
    runSequence = require('gulp4-run-sequence'),
    zip = require('gulp-zip'),
    config = require('../config.js');

gulp.task('build', function (callback) {
    runSequence('example', 'getData', 'html', 'html', 'image', 'javascript', 'sass', 'tpl', 'zip', callback);
});

gulp.task('zip', function (callback) {
    return gulp.src([config.buildPath + '**/*'])
        .pipe(zip(config.build.releaseName + '.zip'))
        .pipe(gulp.dest("./"))
});