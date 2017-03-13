var gulp = require('gulp')
,concat = require('gulp-concat')
,path = require('path')
,config = require('../config');


gulp.task('concatlib',function(){
    return gulp.src(config.lists.lib)
        .pipe(concat('agd.js'))
        .pipe(gulp.dest(path.join(config.paths.js.dist,'js')))
});