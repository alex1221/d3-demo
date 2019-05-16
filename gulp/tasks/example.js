let gulp = require('gulp'),
    config = require('../config.js');

gulp.task('example', function () {
    return gulp.src([config.sourcePath + 'example/**/*.*'])
        .pipe(gulp.dest(config.buildPath + config.build.srcPath + 'example'));
});