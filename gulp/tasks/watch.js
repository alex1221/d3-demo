let gulp = require('gulp'),
    config = require('../config.js'),
    runSequence = require('gulp4-run-sequence');

gulp.task('watch', async () => {

    gulp.watch([config.sourcePath + 'tpl/**/*.tpl'], async () => {
        runSequence('tpl')
    });

    gulp.watch([config.sourcePath + 'scss/**/*.*'], async () => {
        runSequence('sass')
    });

    gulp.watch([config.sourcePath + 'images/**/*.*'], async () => {
        runSequence('image')
    });

    gulp.watch([config.sourcePath + 'js/**/*.*'], async () => {
        runSequence('javascript')
    });

    gulp.watch([config.sourcePath + 'view/**/*.html'], async () => {
        runSequence('html')
    });
})