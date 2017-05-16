'use strict';

var gulp = require('gulp')
,gutil = require('gulp-util')
,less = require('gulp-less')
,path = require('path')
,runSequence = require('run-sequence')
,imagemin = require('gulp-imagemin')
,prettify = require('gulp-jsbeautifier')
,pngquant = require('imagemin-pngquant')
,htmlmin = require('gulp-htmlmin')
,cssnano = require('gulp-cssnano')
,mustache = require("gulp-mustache")
,uglify = require('gulp-uglify')
,git = require('gulp-git')
,bump = require('gulp-bump')
,concat = require('gulp-concat')
,rename = require('gulp-rename')
,strip = require('gulp-strip-comments')
,data = require('gulp-data')
,gulpif = require('gulp-if')
,fs = require('fs')
,request = require('request')
,ftp = require( 'vinyl-ftp' )
,argv = require('yargs').argv;
/*
*
*  Local vars
*
*/
var conf = null;
var outdir = null;
var settings = null;
var srcdir = null;

var ERROR_LEVELS = ['error', 'warning'];

function isFatal(level) {
   return ERROR_LEVELS.indexOf(level) <= ERROR_LEVELS.indexOf(fatalLevel || 'error');
}


function handleError(level, error) {
   gutil.log(error.message);
   if (isFatal(level)) {
      process.exit(1);
   }
}

/*
*   Optimize all image files.
*/

gulp.task('img-crush',function(){
    //Compress Images
    return gulp.src('./src/img/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(path.join(outdir,'img')));
});

/*
*   Compile Less into css
*/
gulp.task('make-css',function(callback){
    runSequence(
        'make-css1',
        'move-css',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('Build JS successful');
          }
          callback(error);
      });
});
gulp.task('make-css1',function(){
    // .less => .css
    //var lesspath = path.join(srcdir,'less/*.less');
    return gulp.src(path.join(srcdir,'less/*.less'))
        .pipe(less({
          paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest(path.join(srcdir,'css')))
        .on('error',gutil.log);
});

/*
*   Copy compiled css to outdir
*/
gulp.task('move-css',function(){
    var cssdir = path.join(srcdir,'css')
    return gulp.src(cssdir + "/*.css")
        .pipe(gulp.dest(path.join(outdir,'css')));
});


/*
*   Minify *.css
*/
gulp.task('min-css',['min-css1','min-css2','min-css3']);

gulp.task('min-css1',function(){
    //Compress CSS
    return gulp.src('./src/css/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest(path.join(outdir,'css')));
});

gulp.task('min-css2',function(){
    //Compress CSS
    return gulp.src('./src/agd/dijit/css/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest(path.join(outdir,'/agd/dijit/css')));
});

gulp.task('min-css3',function(){
    //Compress CSS
    return gulp.src('./src/agd/css/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest(path.join(outdir,'agd/css')));
});


/*
*   Minifi *.js
*/
//gulp.task('min-js',['min-js1','min-js2','min-js3','concat-js1','min-js4','js-copy']);
gulp.task('min-js', function (callback) {
    runSequence(
        'min-js1',
        'min-js2',
        'min-js3',
        'concat-js1',
        'min-js4',
        'min-js5',
        'js-copy',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('Build JS successful');
          }
          callback(error);
    });
});

gulp.task('min-js1',function(){
    return gulp.src('./src/js/*.js')
        .pipe(uglify())
        .on("error", console.log)
        .pipe(gulp.dest(path.join(outdir,'js')));
});

gulp.task('min-js2',function(){
    return gulp.src('./src/agd/dijit/*.js')
        .pipe(uglify())
        .on("error", console.log)
        .pipe(gulp.dest(path.join(outdir,'agd/dijit')));
});

gulp.task('min-js3',function(){
    return gulp.src('./src/agd/*.js')
        .pipe(uglify())
        .on("error", console.log)
        .pipe(gulp.dest(path.join(outdir,'agd')));
});

gulp.task('concat-js1', function(){
    return gulp.src(['./src/lib/agd.arc.js','./src/lib/agd.arc.Utils.js', './src/lib/agd.arc.Widgets.GoToXY.js','./src/lib/agd.arc.Widgets.MultiSelect.js',	'./src/lib/agd.arc.MapFunctions.js','./src/lib/agd.arc.Widgets.Identify.js','./src/lib/agd.arc.Widgets.Print.js','./src/lib/agd.arc.Widgets.Measure.js','./src/lib/agd.arc.Widgets.TaxEstCalc.js','./src/lib/CollapsibleLists.js'])
        .pipe(concat('agd.js'))
        .on("error", console.log)
        .pipe(strip())
        .pipe(gulp.dest(path.join(outdir,'js')));
});

gulp.task('min-js4',function(){
    return gulp.src(path.join(outdir,'js/agd.js'))
        .pipe(uglify())
        .on("error", console.log)
        .pipe(rename(function(path){
            path.basename += '.min';
            path.extname = '.js';
            return path;
        }))
        .pipe(gulp.dest(path.join(outdir,'js')));
});

gulp.task('min-js5',function(){
    return gulp.src(path.join(srcdir,'js/app.js'))
        .pipe(uglify())
        .on("error", console.log)
        .pipe(rename(function(path){
            path.basename += '.min';
            path.extname = '.js';
            return path;
        }))
        .pipe(gulp.dest(path.join(outdir,'js')));
});


/*
*   Copy thirdparty js files to outdir 
*/
gulp.task('js-copy',function(){
    return gulp.src('./src/extrajs/*.js')
        .pipe(gulp.dest(path.join(outdir,'js')));
});

gulp.task('copy-dirs',function() {
    var dirs = [];
    if(conf.copydirs) {
        for(var i = 0; i < conf.copydirs.length; i += 1) {
            dirs.push(path.join(srcdir,conf.copydirs[i]) + "/**/*");
        }
        console.log(dirs);
        return gulp.src(dirs,  {base:srcdir})
        .pipe(gulp.dest(outdir));
    }
    else{
        return null;
    }
        
    
});

/*
*   Increment build version number
*/
gulp.task('bump-version', function () {
  return gulp.src(['./package.json'])
    .pipe(bump({type: "patch"}).on('error', gutil.log))
    .pipe(gulp.dest('./'));
});

/*
*   Commit to git repo
*/
gulp.task('commit-changes', function () {
  return gulp.src('.')
    .pipe(git.add())
    .pipe(git.commit('Auto-commit from build system.'));
});

/*
*
*   Load config file
*/
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

/*************************************************************************************************************
 _______   _______  _______    ___      __    __   __      .___________.
|       \ |   ____||   ____|  /   \    |  |  |  | |  |     |           |
|  .--.  ||  |__   |  |__    /  ^  \   |  |  |  | |  |     `---|  |----`
|  |  |  ||   __|  |   __|  /  /_\  \  |  |  |  | |  |         |  |     
|  '--'  ||  |____ |  |    /  _____  \ |  `--'  | |  `----.    |  |     
|_______/ |_______||__|   /__/     \__\ \______/  |_______|    |__|     
                                                                        
*/


gulp.task('default', function (callback) {
    console.log("                                                            ");
    console.log("                ## COMMAND LIST ##                          ");
    console.log("  empty => show this                                        ");
    console.log("                                                            ");
    console.log("  bump-version => increment the build number                ");
    console.log("                                                            ");
    console.log("  build --county=[county] --build=[debug|release]           ");
    console.log("                                                            ");
    console.log("  depoly --county=[county] --build=[debug|release]          ");
    console.log("                                                            ");
    console.log("                   ## COUNTIES ##                           ");
    console.log("                       mon-wv                               ");
    console.log("                       hampshire-wv                         ");
    console.log("                       lincoln-ms                           ");
    console.log("                       warren-ms                            ");
    console.log("                       marion-ms                            ");
    console.log("                                                            ");
    console.log("                                                            ");
    console.log(" Examples:                                                  ");
    console.log("           gulp build --county=mon-wv --build=debug         ");
    console.log("           gulp deploy --county=hampshire-wv --build=release");
});

/*
.______    __    __   __   __       _______         __       __  .______   
|   _  \  |  |  |  | |  | |  |     |       \       |  |     |  | |   _  \  
|  |_)  | |  |  |  | |  | |  |     |  .--.  |______|  |     |  | |  |_)  | 
|   _  <  |  |  |  | |  | |  |     |  |  |  |______|  |     |  | |   _  <  
|  |_)  | |  `--'  | |  | |  `----.|  '--'  |      |  `----.|  | |  |_)  | 
|______/   \______/  |__| |_______||_______/       |_______||__| |______/  

*/

gulp.task('build-lib', function (callback) {
    outdir = './dist/agdjsapi';
    runSequence(
        'img-crush',
        'min-css',
        'min-js',
        'bump-version',
        'commit-changes',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('RELEASE FINISHED SUCCESSFULLY');
          }
          callback(error);
    });
});


/********************************************************************************************************
*.___  ___.   ______   .__   __.      ____    __    ____ ____    ____ 
*|   \/   |  /  __  \  |  \ |  |      \   \  /  \  /   / \   \  /   / 
*|  \  /  | |  |  |  | |   \|  |  _____\   \/    \/   /   \   \/   /  
*|  |\/|  | |  |  |  | |  . `  | |______\            /     \      /   
*|  |  |  | |  `--'  | |  |\   |         \    /\    /       \    /    
*|__|  |__|  \______/  |__| \__|          \__/  \__/         \__/     
*                                                                    
*/

gulp.task('build-test', function (callback) {
    runSequence(
        'load-config',
        'img-crush',
        'render',
        'min-html',
        'min-js',
        'make-css',
        'copy-dirs',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('RELEASE FINISHED SUCCESSFULLY');
          }
          callback(error);
    });

});

/***********************************************************************************************************************************
 __    __       ___      .___  ___. .______     _______. __    __   __  .______       _______      ____    __    ____ ____    ____ 
|  |  |  |     /   \     |   \/   | |   _  \   /       ||  |  |  | |  | |   _  \     |   ____|     \   \  /  \  /   / \   \  /   / 
|  |__|  |    /  ^  \    |  \  /  | |  |_)  | |   (----`|  |__|  | |  | |  |_)  |    |  |__    _____\   \/    \/   /   \   \/   /  
|   __   |   /  /_\  \   |  |\/|  | |   ___/   \   \    |   __   | |  | |      /     |   __|  |______\            /     \      /   
|  |  |  |  /  _____  \  |  |  |  | |  |   .----)   |   |  |  |  | |  | |  |\  \----.|  |____         \    /\    /       \    /    
|__|  |__| /__/     \__\ |__|  |__| | _|   |_______/    |__|  |__| |__| | _| `._____||_______|         \__/  \__/         \__/     
                                                                                                                                   
*/
   
gulp.task('build', function (callback) {
    runSequence(
        'load-config',
        'img-crush',
        'config',
        'render',
        'min-html',
        'min-js',
        'min-css',
        'copy-dirs',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('RELEASE FINISHED SUCCESSFULLY');
          }
          callback(error);
    });

});

gulp.task('deploy', function (callback) {

    runSequence(
        'build',
        'ftp',
        //'commit-changes',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('** RELEASE DEPLOYED SUCCESSFULLY **');

            var requestData = {
                text: conf.name + " Arcgis Server Site Deployed to server."
            };

            request('https://hooks.slack.com/services/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',
                    { json: true, body: requestData },
                    function(err, res, body) {
              // `body` is a js object if request was successful
            });
          }
          callback(error);
    });

});

gulp.task('config', function(){
    return gulp.src(path.join(srcdir,'conf.json'))
            .pipe(strip())
            .pipe(gulp.dest(outdir));
});

gulp.task('render',function(){
    return gulp.src(path.join(srcdir, conf.template))
            .pipe(data(function(file) {
                return JSON.parse(fs.readFileSync(settings));
            }))
            .pipe(mustache())
            .pipe(rename(function (path) {
                path.basename = conf.destfile[0];
                path.extname = conf.destfile[1];
            }))
            .pipe(gulpif(conf.minify,htmlmin({collapseWhitespace: true})))
            .pipe(gulp.dest(outdir))

});

gulp.task('min-html',function(){
    return gulp.src(path.join(srcdir,'help.html'))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(outdir));
});

gulp.task('ftp', function(){
    if (conf.deploy == false){
        reuturn;
    }
    var conn = ftp.create(conf.ftp);

    var globs = [
        outdir + '/**'
    ];

    console.log(globs);

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    gulp.src( globs, { base: outdir, buffer: false } )
        .pipe( conn.newer( conf.remotedir ) ) // only upload newer files
        .pipe( conn.dest( conf.remotedir ) );
});