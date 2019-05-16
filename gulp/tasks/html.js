let gulp = require('gulp'),
    config = require('../config.js'),
    fileInclude = require('gulp-file-include');

let childPath = 'view';

gulp.task('html', function () {
    return gulp.src([config.sourcePath + childPath + '/**/*.*'])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(config.buildPath));
})