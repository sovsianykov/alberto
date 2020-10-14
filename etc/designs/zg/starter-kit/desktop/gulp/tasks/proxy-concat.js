/* jshint node:true */

'use strict';

const gulp = require('gulp');
const concat = require('gulp-concat');
const filter = require('gulp-filter');
const fs = require("fs");

gulp.task('proxy-concat-css', ['styles'], function () {
	var jsFileList = fs.readFileSync('css/css.txt', 'utf8')
		.split('\n')
		.map(function (line) {
			return line.includes("{components}") ? "components/**/*" : line;
		})
		.filter(function (line) {
			return !line.startsWith('#') && !line.startsWith('{') && line;
		})
		.map(function (line) {
			return 'css/' + line;
		});

	return gulp.src(jsFileList)
		.pipe(concat('proxy.css'))
		.pipe(gulp.dest('css/core'));
});

gulp.task('proxy-concat-js', function () {
	var jsFileList = fs.readFileSync('js/js.txt', 'utf8')
		.split('\n')
		.map(function (line) {
			return line.includes("{components}") ? "components/**/*" : line;
		})
		.filter(function (line) {
			return !line.startsWith('#') && !line.startsWith('{') && line;
		})
		.map(function (line) {
			return 'js/' + line;
		});

	return gulp.src(jsFileList)
		.pipe(concat('proxy.js'))
		.pipe(gulp.dest('js/proxy'));
});

gulp.task('proxy-concat', ['proxy-concat-css', 'proxy-concat-js']);
