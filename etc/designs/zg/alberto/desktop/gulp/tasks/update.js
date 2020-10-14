/* jshint node:true */

// https://jira.atlassian.com/browse/BSERV-2732
// see also https://bitbucket.org/atlassian/stash-archive/overview?_ga=2.172450787.1106506474.1551282842-287866880.1480173485
// usage example; version is optional, bitbucket 'user' and 'pass' required
// gulp update:default --version <branch|ref|sha|tag|tree> --user foo --pass bar

'use strict';

const gulp = require('gulp');
const argv = require('yargs').argv;
const fs = require('fs-extra');
const download = require('gulp-download2');
const decompress = require('gulp-decompress');
const gulpSequence = require('gulp-sequence');

const config = {
	starterKit: {
		version: ''
	},
	auth: {
		user: '',
		pass: ''
	},
	errorCallback: function (code) {
		console.error("Oh dear");
		if (code === 400) {
			console.error("400; Probably not a valid ref and cannot be archived, open the URL in a browser for detailed error message");
		} else if (code === 401) {
			console.error("401; Probably an authentication error, check username and password");
		} else {
			console.error(code, "something went wrong with the request to Bitbucket");
		}
	},
	tmpPath: './tmp',
	masterPath: 'js-dist'
};

gulp.task('update:download-version', gulpSequence('update:download-js'));

gulp.task('update:download-js', function() {
	var version = argv.ver;
	var path = argv.path;
	var url;
	if (!version) {
		version = "master";
	}
	config.starterKit.version = version;
	if (!path) {
		path = "js-dist";
	}
	if (argv.user) {
		config.auth = `${argv.user}:${argv.pass}`;
		url = `https://bitbucket.unileversolutions.com/rest/api/latest/projects/ATP/repos/adobe-templated-theme/archive?at=${version}&path=${path}&file=/${version}.zip`;
		return download(url, config)
			.pipe(gulp.dest(config.tmpPath));
	} else {
		console.log("!!! ERROR USER NOT SET please add --user='' --pass='' !!!");
	}
});

gulp.task('update:unzip-js', function(){
	console.log('unzipping assets to', config.masterPath);
	return gulp.src(config.tmpPath + '/*.zip')
		.pipe(decompress({strip: 1}))
		.pipe(gulp.dest(config.masterPath));
});

gulp.task('update:clean-up', function(){
	console.log('clean up temp folder(s)');
	fs.remove(config.tmpPath);
});

gulp.task('update:js-build', gulpSequence('scripts:build-js-folder', 'scripts:sync-localised-js-folder'));

gulp.task('update', function() {
	console.log("To upgrade starter kit JS to a newer version...");
	console.log("run $ gulp update:default --user=foo --pass=bar to install latest js (use --ver=starterkit-0.XX.x-aem to download a specific build)");
	console.log("To upgrade JS client library after editing localised JS");
	console.log("run $ gulp update:sync-localised-js-folder to copy localised js from the desktop/js to the desktop/dist/js folder");
});

gulp.task('update:default', gulpSequence('update:clean-up','update:download-version','update:unzip-js','update:js-build','update:clean-up', 'concat:jstxt', 'concat', 'proxy-concat-js'));
