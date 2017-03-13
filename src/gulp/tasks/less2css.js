'use strict';

var gulp = require('gulp')
,gutil = require('gulp-util')
,less = require('gulp-less')
,path = require('path')
,config = require('../config');


gulp.task('less2css', function(){
    return gulp.src(path.join(srcdir, 'less/*.less'))
        .pipe(less({
            paths: [path.join(__dirname,'less','includes')]
        }))
        pipe(gulp.dest(path.join(srcdir,'css')))
});