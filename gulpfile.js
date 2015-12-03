const gulp      = require('gulp'),
      exec      = require('child_process').exec;

gulp.task('test', function (cb) {
  exec('lab test/test-and.js');
});

gulp.task('default', ['test']);
