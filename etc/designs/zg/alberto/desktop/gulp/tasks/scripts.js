/* jshint node:true */

// Usage example;
// $ gulp scripts:js-build to build the desktop/js folder from the source files

'use strict';

const gulp = require('gulp');
const fs = require('fs-extra');
const gulpSequence = require('gulp-sequence');

const config = {
	masterPath: 'js-dist',
	outputPath: 'js',
	overridePath: 'js-localised'
};

function notMD(src) {
	// don't copy markdown files
	return !src.match(/\.md$/);
}

gulp.task('scripts:build-js-folder', function(){
	return fs.copySync( config.masterPath, config.outputPath );
});

gulp.task('scripts:sync-localised-js-folder', function(){
	return fs.copySync(config.overridePath, config.outputPath, {filter: notMD} );
});

gulp.task('scripts:sync-localised-head-js-folder', function(){
	return fs.copySync(`${config.overridePath}/head`, `${config.outputPath}/head`, {filter: notMD} );
});

gulp.task('scripts', function() {
	console.log("Usage example; $ gulp scripts:js-build to build the desktop/js folder from the source files");
});

gulp.task('scripts:js-build', gulpSequence('scripts:build-js-folder', 'scripts:sync-localised-js-folder'));

