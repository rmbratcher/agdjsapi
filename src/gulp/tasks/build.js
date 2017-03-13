var config = require('../config')
    ,gulp = require('gulp')
    ,browserSync = require('browser-sync')
    ,gutil = require('gulp-util')
    ,path = require('path')
    ,runSequence = require('run-sequence')
    ,fs = require('fs')
    ,request = require('request')
    ,ftp = require( 'vinyl-ftp' )
    ,argv = require('yargs').argv
    /** Config vars */
    ,conf = null
    ,outdir = null
    ,settings = null
    ,srcdir = null;


gulp.task('build',function() {
    runSequence(
        'load-config',
        'img-crush',
        'config',
        'render',
        'min-html',
        'min-js',
        'min-css',
        'copy-dirs',
        function(error){
            if(error){
                console.log(error.message);
            } else {
                console.log("Build Finished")
            }
        });
});