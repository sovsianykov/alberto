/* jshint node:true */

'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const filter = require('gulp-filter');
const gulpSequence = require('gulp-sequence');

gulp.task('concat', function () {
	return gulp.src('js/head/*.js')
		.pipe(filter(function (file) {
			return (!/^head\.js$/.test(file.relative));
		}))
		.pipe(concat('head.js'))
		.pipe(gulp.dest('js/head'));
});

gulp.task('concat:lazystyles-build', gulpSequence('proxy-concat-css', 'concat:lazystyles'));

gulp.task('concat:lazystyles', function () {
	return gulp.src(['css/**/*.lazyload.css','!css/lazy/**'])
		.pipe(concat('lazyload.css'))
		.pipe(gulp.dest('css/lazy'));
});

gulp.task('concat:jstxt', function () {
	return gulp.src(['js-dist/js.txt','js-localised/js.txt'])
		.pipe(concat('js.txt'))
		.pipe(gulp.dest('js'));
});
