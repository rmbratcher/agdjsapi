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
    return gulp.src('./src/lib/*.js')
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


/*
*   Copy thirdparty js files to outdir
*/
gulp.task('js-copy',function(){
    return gulp.src('./src/extrajs/*.js')
        .pipe(gulp.dest(path.join(outdir,'js')));
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
    console.log("  make --county=[county] --build=[debug|release]            ");
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

gulp.task('build-mon-wv', function (callback) {
    outdir = './dist/mon';
    runSequence(
        'make-css',
        'img-crush',
        'min-css',
        'mon-wv',
        'min-html',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('RELEASE FINISHED SUCCESSFULLY');

            var requestData = {
                text: "Build finished for Mon, WV Arcgis Server Site."
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


gulp.task('mon-wv',['mon-wv-copy','min-js','mon-wv-make-css']);

gulp.task('mon-wv-copy',function(){
    return gulp.src('./counties/mon-wv/app.js')
        .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
        .pipe(gulp.dest(path.join(outdir,'js')));
});

/*
*   Compile .less into .css
*/

gulp.task('mon-wv-make-css',['mon-wv-make-css1','mon-wv-make-css2']);

gulp.task('mon-wv-make-css1',function(){
    // .less => .css
    return gulp.src('./src/counties/mon-wv/css/**/*.less')
        .pipe(less({
          paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest(path.join(outdir,'mon-wv/css')))
        .on('error',gutil.log);
});

gulp.task('mon-wv-make-css2',function(){
    // .less => .css
    return gulp.src('./src/agd/**/*.less')
        .pipe(less({
          paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest(path.join(outdir,'agd')));
});

/*
*   Minify html
*/

gulp.task('min-html',function(){
    return gulp.src('./*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(outdir));
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
        'commit-changes',
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
                path.basename = "index";
                path.extname = ".html"
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