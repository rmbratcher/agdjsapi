var gulp = require('gulp')
,imagemin = require('gulp-imagemin')
,pngquant = require('imagemin-pngquant')
,path = require('path')
config = require('../config.js');

gulp.task('config', function(){
    return gulp.src(path.join(srcdir,'conf.json'))
            .pipe(strip())
            .pipe(gulp.dest(outdir));
});