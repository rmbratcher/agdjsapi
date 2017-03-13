var gulp = require('gulp')
,imagemin = require('gulp-imagemin')
,pngquant = require('imagemin-pngquant')
,path = require('path')
config = require('../config.js');

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