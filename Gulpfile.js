var es = require('event-stream');
var gulp = require('gulp');
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');

gulp.task('scripts', function() {
  var copyVendor = gulp.src(['assets/js/vendor/**'])
    .pipe(gulp.dest('public/js/vendor'));

  var minify = gulp.src(['assets/js/**/*.js', '!assets/js/vendor/**'])
    //.pipe(uglify())
    .pipe(gulp.dest('public/js'));

  return es.concat(copyVendor, minify);
});

gulp.task('stylus', function() {
  return gulp.src('assets/css/style.styl')
    .pipe(stylus({ use: ['nib'], set: ['compress'] }))
    .pipe(gulp.dest('public/css'));
});

gulp.task('dev', ['default'], function() {
  gutil.log('Watching assets/** for changes');
  gulp.watch('assets/**/*.js', ['scripts']);
  gulp.watch('assets/css/*.styl', ['stylus']);

  nodemon({ script: 'bin/app.js', options: '--watch src' });
});

gulp.task('default', ['scripts', 'stylus']);
