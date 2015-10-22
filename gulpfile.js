/**
 * Created by Arnun on 15/10/2558.
 */
var gulp = require('gulp');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var browserSync = require('browser-sync').create();

var paths = {
    jade: './src/**/*.jade',
    scss: './src/scss/**/*.scss'
};

/*================ Convert Zone ===================*/
gulp.task('do_jade', function(){
   gulp.src(paths.jade)
       .pipe(jade())
       .pipe(gulp.dest('./www'));
});

gulp.task('do_sass', function(){
   gulp.src(paths.scss)
       .pipe(sass())
       .pipe(gulp.dest('./www/css'))
       .pipe(browserSync.stream());
});

/*-------------- end convert ---------------*/

/*================ WATCH Zone ===================*/
gulp.task('watchChange', function(){
    gulp.watch(paths.jade, ['do_jade']);
    gulp.watch(paths.scss, ['do_sass']);
});

/* server Sync use Watch */
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: "./www"
        }
    });

    gulp.watch(['./www/**/*.*']).on("change", browserSync.reload);
});

/*------------- End Watch --------------*/

//เรียก function ไว้ ก๊อปไฟล์เข้า App อย่างเดียว
gulp.task('duplicateJS', function(){
   gulp.src('bower_components/**/*.*')
       .pipe(gulp.dest('app/js'));
});

gulp.task('test', function(){
    console.log('OK WOW!');
});

gulp.task('default', ['do_jade', 'do_sass','watchChange','serve']);