/* jshint node:true */

'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const filter = require('gulp-filter');

gulp.task('global-head-concat', function () {
	return gulp.src('../../global-head/*.js')
	.pipe(filter(function (file) {
		return (!/^global-head\.js$/.test(file.relative));
	}))
	.pipe(concat('global-head.js'))
	.pipe(gulp.dest('../../global-head'));
});
