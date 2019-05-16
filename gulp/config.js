let date = new Date(),
    Y = date.getFullYear(),
    M = date.getMonth() + 1,
    D = date.getDate() + 1,
    hh = date.getHours(),
    mm = date.getMinutes(),
    ss = date.getSeconds();

M = M > 9 ? m : '0' + M;
D = D > 9 ? D : '0' + D;
hh = hh > 9 ? hh : '0' + hh;
mm = mm > 9 ? mm : '0' + mm;
ss = ss > 9 ? ss : '0' + ss;

module.exports = {
    sourcePath: './src/',
    buildPath: './build/',
    dataPath: './build/assets/data/',
    build: {
        cName: 'd3Animation',
        srcPath: 'assets/',
        releaseName: 'd3Animation' + Y + M + D + hh + mm + ss
    }
}