/* jshint node:true */

'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch');

gulp.task('dev', ['concat', 'cache-styles'], function () {
	gulp.watch('sass/**/*.scss', ['styles:build']);
	gulp.watch('js-localised/js.txt', ['concat:jstxt']);
	watch(['js-localised/**/*.js', 'js-dist/**/*.js', '!*/head/*.js'], function() {
		gulp.start(['scripts:sync-localised-js-folder', 'jshint:dev', 'jscs:dev', 'proxy-concat-js']);
	});
	gulp.watch(['js-localised/head/*.js'], ['scripts:sync-localised-head-js-folder', 'concat']);
});
