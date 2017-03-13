var gulp = require('gulp')
,imagemin = require('gulp-imagemin')
,pngquant = require('imagemin-pngquant')
,path = require('path')
config = require('../config.js');

gulp.task('img-crush',function(){
    //Compress Images
    return gulp.src(config.paths.img.src)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(path.join(config.paths.js.dist,'img')));
});