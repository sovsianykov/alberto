/* jshint node:true */

'use strict';

const gulp = require('gulp');
const jscs = require('gulp-jscs');

gulp.task('jscs:dev', function() {
	return gulp.src(['js-localised/**/*.js', 'js-dist/**/*.js', '!**/polyfills/*.js', '!**/head/*.js', '!**/libs/*.js', '!**/proxy/proxy.js'])
		.pipe(jscs())
		.pipe(jscs.reporter());
});

gulp.task('jscs:build', function() {
	return gulp.src(['js-localised/**/*.js', 'js-dist/**/*.js', '!**/polyfills/*.js', '!**/head/*.js', '!**/libs/*.js', '!**/proxy/proxy.js'])
		.pipe(jscs())
		.pipe(jscs.reporter())
		.pipe(jscs.reporter('fail'));
});
