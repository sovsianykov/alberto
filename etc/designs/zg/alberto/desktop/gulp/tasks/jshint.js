/* jshint node:true */

'use strict';

const gulp = require('gulp');
const jshint = require('gulp-jshint');

gulp.task('jshint:dev', function() {
	return gulp.src(['js-localised/**/*.js','js-dist/**/*.js','!**/head/*.js','!**/libs/*.js','!**/polyfills/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('jshint:build', function() {
	return gulp.src(['js-localised/**/*.js','js-dist/**/*.js','!**/head/*.js','!**/libs/*.js','!**/polyfills/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});
