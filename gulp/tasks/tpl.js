let gulp = require('gulp'),
    config = require('../config.js'),
    tmodjs = require('gulp-tmod');

let childPath = 'tpl';

gulp.task('tpl', function () {
    return gulp.src([config.sourcePath + childPath + '/**/*.*'])
        .pipe(tmodjs({
            templateBase: config.sourcePath + childPath,
            combo: true,
            type: 'amd',
            output: config.buildPath + config.build.srcPath + 'template',
            helpers: config.buildPath + config.build.srcPath + 'js/common/helper.js'
        }))
        .pipe(gulp.dest(config.buildPath + config.build.srcPath + 'template'));
});