let gulp = require('gulp'),
    config = require('../config.js');

let childPath = 'images';

gulp.task('image', function () {
    return gulp.src([config.sourcePath + childPath + '/**/*.*'])
        .pipe(gulp.dest(config.buildPath + config.build.srcPath + childPath));
});