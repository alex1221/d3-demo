let gulp = require('gulp'),
    through = require('through2'),
    path = require('path'),
    fs = require('fs'),
    config = require('../config.js'),
    commands = [];

// 获取路径并保存
gulp.task('getData', function () {
    return gulp.src('src/example/*/*.html')
        .pipe(through.obj(function (file, enc, callback) {
            let data = {
                fileName: file.stem,
                filePath: file.relative
            };

            this.push(data);
            callback();
        }))
        .on('data', function (data) {
            if (data.fileName[0] !== '_') {
                commands.push(data);
            }
        })
        .on('end', () => {
            doSomethingSpecial(commands)
        })
});

function mkdirs(dirpath, callback) {
    fs.exists(dirpath, function (exists) {
        if (exists) {
            callback();
        } else {
            //尝试创建父目录，然后再创建当前目录
            mkdirs(path.dirname(dirpath), function () {
                fs.mkdir(dirpath, callback);
            });
        }
    })
};

function doSomethingSpecial(commands) {
    mkdirs(config.dataPath, function (err) {
        if (err) console.error(err)
        fs.writeFile(config.dataPath + 'url.json', JSON.stringify(commands, null, '\t'), 'utf-8', function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log('写入成功');
            }
        });
    });
}