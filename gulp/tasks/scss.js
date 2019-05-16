let gulp = require('gulp'),
    config = require('../config.js'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass');

let childPath = 'scss';

gulp.task('sass', function () {
    return gulp.src([config.sourcePath + childPath + '/**/*.*'])
        .pipe(plumber({
            errorHandler: function (error) {
                this.emit('end');
            }
        }))
        .pipe(sass().on('error', function (error) {
            console.log(error.toString());
            this.emit('end');
        }))
        .pipe(gulp.dest(config.buildPath + config.build.srcPath + 'css'));
});