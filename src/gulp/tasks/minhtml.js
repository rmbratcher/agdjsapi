var config = require('../config')
, gulp = require('gulp')
, htmlmin = require('gulp-htmlmin');

gulp.task('min-html',function(){
    return gulp.src(path.join(srcdir,'help.html'))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(outdir));
});
