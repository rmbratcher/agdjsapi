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
 
    

    gulp.task('default',['concatlib','img-crush'], function(){
    });