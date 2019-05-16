let gulp = require('gulp'),
    config = require('../config.js'),
    connect = require('gulp-connect'),
    proxy = require('http-proxy-middleware');

gulp.task('webserver', function () {
    connect.server({
        livereload: true,
        root: "./" + config.buildPath,
        port: 8081,
        // middleware: function (connect, opt) {
        //     return [
        //         proxy('/test', {
        //             target: 'http://localhost:8000',
        //             changeOrigin: true,
        //         })
        //     ]
        // }
    });
});