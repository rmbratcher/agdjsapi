'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var path = require('path');
var runSequence = require('run-sequence');
var imagemin = require('gulp-imagemin');
var prettify = require('gulp-jsbeautifier');
var pngquant = require('imagemin-pngquant');
var htmlmin = require('gulp-htmlmin');
var cssnano = require('gulp-cssnano');
var mustache = require("gulp-mustache");
var uglify = require('gulp-uglify');
var git = require('gulp-git');
var bump = require('gulp-bump');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var strip = require('gulp-strip-comments');
var fs = require('fs');
var request = require('request');
var ftp = require( 'vinyl-ftp' );
/*
*
*  Local vars
*
*/
var conf = null;
var outdir = null;

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
gulp.task('min-js',['min-js1','min-js2','min-js3','concat-js1','min-js4','js-copy']);

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


/*************************************************************************************************************
 _______   _______  _______    ___      __    __   __      .___________.
|       \ |   ____||   ____|  /   \    |  |  |  | |  |     |           |
|  .--.  ||  |__   |  |__    /  ^  \   |  |  |  | |  |     `---|  |----`
|  |  |  ||   __|  |   __|  /  /_\  \  |  |  |  | |  |         |  |     
|  '--'  ||  |____ |  |    /  _____  \ |  `--'  | |  `----.    |  |     
|_______/ |_______||__|   /__/     \__\ \______/  |_______|    |__|     
                                                                        
*/


gulp.task('default', function () {
    console.log("*************************************************************");
    console.log("*      Command List                                         *");
    console.log("*  [empty] = show this                                      *");
    console.log("*  build-lib = compile js library (included in all others)  *");
    console.log("*                                                           *");
    console.log("*                   ## COUNTIES ##                          *");
    console.log("*                                                           *");
    console.log("*        Monongalia, WV                                     *");
    console.log("*  build-mon-wv                                             *");
    console.log("*  depoly-mon-wv                                            *");
    console.log("*                                                           *");
    console.log("*        Hampshire, WV                                      *");
    console.log("*  build-hampshire-wv                                       *");
    console.log("*  deploy-hampshire-wv                                      *");
    console.log("*                                                           *");
    console.log("*        Lincoln, MS                                        *");
    console.log("*  build-lincoln-ms                                         *");
    console.log("*  deploy-lincoln-ms                                        *");
    console.log("*                                                           *");
    console.log("*        Marion, MS                                         *");
    console.log("*  build-marion-ms                                          *");
    console.log("*  deploy-marion-ms                                         *");
    console.log("*                                                           *");
    console.log("*        Warren, MS                                         *");
    console.log("*  build-warren-ms                                          *");
    console.log("*  deploy-warren-ms                                         *");
    console.log("*                                                           *");
    console.log("*************************************************************");

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

/*gulp.task('deploy-mon-wv',function(){

});*/


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
    
gulp.task('build-hampshire-wv', function (callback) {
    outdir = '../sandbox/hampshire';
    runSequence(
        'img-crush',
        'hampshire-wv-config',
        'hampshire-min-html',
        'min-js',
        'min-css',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('RELEASE FINISHED SUCCESSFULLY');

            /*var requestData = {
                text: "Build finished for Hampshire, WV Arcgis Server Site."
            };

            request('https://hooks.slack.com/services/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',
                    { json: true, body: requestData },
                    function(err, res, body) {
              // `body` is a js object if request was successful
            });*/
          }
          callback(error);
    });

});

gulp.task('deploy-hampshire-wv', function (callback) {
    outdir = '../sandbox/hampshire';
    runSequence(
        'build-hampshire-wv',
        'hampshire-wv-ftp',
        'commit-changes',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('** RELEASE DEPLOYED SUCCESSFULLY **');

            var requestData = {
                text: "Hampshire, WV Arcgis Server Site Deployed to server."
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

gulp.task('hampshire-wv-config', function(){
    return gulp.src('./src/counties/hampshire-wv/*.json')
            .pipe(strip())
            .pipe(gulp.dest(outdir));
});

gulp.task('hampshire-min-html',function(){
    return gulp.src('./src/counties/hampshire-wv/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(outdir));
});

gulp.task('hampshire-wv-ftp', function(){
    var conn = ftp.create( {
        host:     '192.168.2.171',
        user:     'ftpuser',
        password: 'goftp',
        port:     21,
        parallel: 5,
        log:      gutil.log,
        reload:   true,
        debug:    true
    } );

    var globs = [
        outdir + '/**'
    ];

    console.log(globs);

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    gulp.src( globs, { base: outdir, buffer: false } )
        .pipe( conn.newer( '/hampshire' ) ) // only upload newer files
        .pipe( conn.dest( '/hampshire' ) );
});

/************************************************************************************************************
.___  ___.      ___      .______       __    ______   .__   __.        .___  ___.      _______.
|   \/   |     /   \     |   _  \     |  |  /  __  \  |  \ |  |        |   \/   |     /       |
|  \  /  |    /  ^  \    |  |_)  |    |  | |  |  |  | |   \|  |  ______|  \  /  |    |   (----`
|  |\/|  |   /  /_\  \   |      /     |  | |  |  |  | |  . `  | |______|  |\/|  |     \   \    
|  |  |  |  /  _____  \  |  |\  \----.|  | |  `--'  | |  |\   |        |  |  |  | .----)   |   
|__|  |__| /__/     \__\ | _| `._____||__|  \______/  |__| \__|        |__|  |__| |_______/    
                                                                                               
*/

gulp.task('build-marion-ms', function (callback) {
    outdir = '../sandbox/marion';
    runSequence(
        'img-crush',
        'marion-ms-config',
        'marion-ms-min-html',
        'min-js',
        'min-css',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('RELEASE FINISHED SUCCESSFULLY');

            /*var requestData = {
                text: "Build finished for Marion, MS Arcgis Server Site."
            };

            request('https://hooks.slack.com/services/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',
                    { json: true, body: requestData },
                    function(err, res, body) {
              // `body` is a js object if request was successful
            });*/
          }
          callback(error);
    });

});

gulp.task('deploy-marion-ms', function (callback) {
    outdir = '../sandbox/marion';
    runSequence(
        'build-marion-ms',
        'marion-ms-ftp',
        'commit-changes',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('** RELEASE DEPLOYED SUCCESSFULLY **');

            var requestData = {
                text: "Marion, MS Arcgis Server Site Deployed to server."
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

gulp.task('marion-ms-config', function(){
    return gulp.src('./src/counties/marion-ms/*.json')
            .pipe(strip())
            .pipe(gulp.dest(outdir));
});

gulp.task('marion-ms-min-html',function(){
    return gulp.src('./src/counties/marion-ms/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(outdir));
});

gulp.task('marion-ms-ftp', function(){
    var conn = ftp.create( {
        host:     '192.168.2.171',
        user:     'ftpuser',
        password: 'goftp',
        port:     21,
        parallel: 5,
        log:      gutil.log,
        reload:   true,
        debug:    true
    } );

    var globs = [
        outdir + '/**'
    ];

    console.log(globs);

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    gulp.src( globs, { base: outdir, buffer: false } )
        .pipe( conn.newer( '/marion' ) ) // only upload newer files
        .pipe( conn.dest( '/marion' ) );
});

/***************************************************************************************************************
 __       __  .__   __.   ______   ______    __      .__   __.        .___  ___.      _______.
|  |     |  | |  \ |  |  /      | /  __  \  |  |     |  \ |  |        |   \/   |     /       |
|  |     |  | |   \|  | |  ,----'|  |  |  | |  |     |   \|  |  ______|  \  /  |    |   (----`
|  |     |  | |  . `  | |  |     |  |  |  | |  |     |  . `  | |______|  |\/|  |     \   \    
|  `----.|  | |  |\   | |  `----.|  `--'  | |  `----.|  |\   |        |  |  |  | .----)   |   
|_______||__| |__| \__|  \______| \______/  |_______||__| \__|        |__|  |__| |_______/    
*/                                                                                              

gulp.task('build-lincoln-ms', function (callback) {
    outdir = '../sandbox/lincoln';
    runSequence(
        'img-crush',
        'lincoln-ms-config',
        'lincoln-ms-min-html',
        'min-js',
        'min-css',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('RELEASE FINISHED SUCCESSFULLY');

            /*var requestData = {
                text: "Build finished for Lincoln, MS Arcgis Server Site."
            };

            request('https://hooks.slack.com/services/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',
                    { json: true, body: requestData },
                    function(err, res, body) {
              // `body` is a js object if request was successful
            });*/
          }
          callback(error);
    });

});

gulp.task('deploy-lincoln-ms', function (callback) {
    outdir = '../sandbox/lincoln';
    runSequence(
        'build-lincoln-ms',
        'lincoln-ms-ftp',
        'commit-changes',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('** RELEASE DEPLOYED SUCCESSFULLY **');

            var requestData = {
                text: "Lincoln, MS Arcgis Server Site Deployed to server."
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

gulp.task('lincoln-ms-config', function(){
    return gulp.src('./src/counties/lincoln-ms/*.json')
            .pipe(strip())
            .pipe(gulp.dest(outdir));
});

gulp.task('lincoln-ms-min-html',function(){
    return gulp.src('./src/counties/lincoln-ms/*.html')
        .pipe(htmlmin({collapseWhitespace: false}))
        .pipe(gulp.dest(outdir));
});

gulp.task('lincoln-ms-ftp', function(){
    var conn = ftp.create( {
        host:     '192.168.2.171',
        user:     'ftpuser',
        password: 'goftp',
        port:     21,
        parallel: 5,
        log:      gutil.log,
        reload:   true,
        debug:    true
    } );

    var globs = [
        outdir + '/**'
    ];

    console.log(globs);

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    gulp.src( globs, { base: outdir, buffer: false } )
        .pipe( conn.newer( '/lincoln' ) ) // only upload newer files
        .pipe( conn.dest( '/lincoln' ) );
});

/**************************************************************************************************************
____    __    ____  ___      .______      .______       _______ .__   __.        .___  ___.      _______.
\   \  /  \  /   / /   \     |   _  \     |   _  \     |   ____||  \ |  |        |   \/   |     /       |
 \   \/    \/   / /  ^  \    |  |_)  |    |  |_)  |    |  |__   |   \|  |  ______|  \  /  |    |   (----`
  \            / /  /_\  \   |      /     |      /     |   __|  |  . `  | |______|  |\/|  |     \   \    
   \    /\    / /  _____  \  |  |\  \----.|  |\  \----.|  |____ |  |\   |        |  |  |  | .----)   |   
    \__/  \__/ /__/     \__\ | _| `._____|| _| `._____||_______||__| \__|        |__|  |__| |_______/    
*/

gulp.task('build-warren-ms', function (callback) {
    outdir = '../sandbox/warren';
    runSequence(
        'img-crush',
        'warren-ms-config',
        'warren-ms-min-html',
        'min-js',
        'min-css',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('RELEASE FINISHED SUCCESSFULLY');

            /*var requestData = {
                text: "Build finished for Warren, MS Arcgis Server Site."
            };

            request('https://hooks.slack.com/services/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',
                    { json: true, body: requestData },
                    function(err, res, body) {
              // `body` is a js object if request was successful
            });*/
          }
          callback(error);
    });

});

gulp.task('deploy-warren-ms', function (callback) {
    outdir = '../sandbox/warren';
    runSequence(
        'build-warren-ms',
        'warren-ms-ftp',
        'commit-changes',
        function (error) {
          if (error) {
            console.log(error.message);
          } else {
            console.log('** RELEASE DEPLOYED SUCCESSFULLY **');

            var requestData = {
                text: "Warren, MS Arcgis Server Site Deployed to server."
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

gulp.task('warren-ms-config', function(){
    return gulp.src('./src/counties/warren-ms/*.json')
            .pipe(strip())
            .pipe(gulp.dest(outdir));
});

gulp.task('warren-ms-min-html',function(){
    return gulp.src('./src/counties/warren-ms/*.html')
        .pipe(htmlmin({collapseWhitespace: false}))
        .pipe(gulp.dest(outdir));
});

gulp.task('warren-ms-ftp', function(){
    var conn = ftp.create( {
        host:     '192.168.2.171',
        user:     'ftpuser',
        password: 'goftp',
        port:     21,
        parallel: 5,
        log:      gutil.log,
        reload:   true,
        debug:    true
    } );

    var globs = [
        outdir + '/**'
    ];

    console.log(globs);

    // using base = '.' will transfer everything to /public_html correctly
    // turn off buffering in gulp.src for best performance

    gulp.src( globs, { base: outdir, buffer: false } )
        .pipe( conn.newer( '/warren' ) ) // only upload newer files
        .pipe( conn.dest( '/warren' ) );
});
