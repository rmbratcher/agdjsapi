var gulp = require('gulp')
, mustache = require('gulp-mustache')
, config = require('../config');


gulp.task('render',function(){
    return gulp.src(path.join(srcdir, conf.template))
            .pipe(data(function(file) {
                return JSON.parse(fs.readFileSync(settings));
            }))
            .pipe(mustache())
          re  .pipe(rename(function (path) {
                path.basename = conf.destfile[0];
                path.extname = conf.destfile[1];
            }))
            .pipe(gulpif(conf.minify,htmlmin({collapseWhitespace: true})))
            .pipe(gulp.dest(outdir))

});