/* jshint node:true */

'use strict';

const gulp = require('gulp');

gulp.task('build', function() {
	return gulp.start('concat:lazystyles-build', ['scripts:js-build', 'jshint:build', 'jscs:build', 'concat', 'concat:jstxt', 'global-head-concat', 'proxy-concat-js']);
});
