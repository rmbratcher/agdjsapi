var gulp = require('gulp')
,argv = require('yargs').argv
,path = require('path')
,config = require('../config');

gulp.task('load-config', function(){
    settings = path.join('src','counties', argv.county, argv.build + '.json');
    console.log(settings);
    return gulp.src(settings)
            .pipe(data(function(file){
                conf = JSON.parse(fs.readFileSync(settings));
                outdir = conf.outdir;
                srcdir = conf.srcdir;
            }));
});