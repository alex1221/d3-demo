let gulp = require('gulp'),
    config = require('../config.js');

let childPath = 'js';

gulp.task('javascript', function () {
    return gulp.src([config.sourcePath + childPath + '/**/*.*'])
        .on('error', function (error) {
            console.log(error.toString());
            this.emit('end');
        })
        .pipe(gulp.dest(config.buildPath + config.build.srcPath + childPath));
});