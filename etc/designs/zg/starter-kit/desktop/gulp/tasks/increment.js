/* jshint node:true */

// usage examples
// $ gulp increment   				    1-2-3 => 1-2-4  (same as $ gulp increment --type patch)
// $ gulp increment --type minor  	    1-2-3 => 1-3-0	(alias --minor)
// $ gulp increment --type major  	    1-2-3 => 2-0-0	(alias --major)
// $ gulp increment --version 0-0-1  	1-2-3 => 0-0-1
// $ gulp increment --build 			then builds

// supported params (all optional)
// 		--type 		: {string} which version number to increment (patch, minor, major)
//		--version 	: {string} hard code a specific version number
//		--branch	: {string} specify a git branch to update
//		--build		: {void} run '$ gulp build' after increment

// e.g. gulp increment --build --branch develop


'use strict';

const gulp = require('gulp');
const argv = require('yargs').argv;
const fs = require('fs');
const git = require('gulp-git');

const options = {
	json: "../theme.json",
	branch: "",
	delimeter: "-",
	type: "patch",
	versionHash: {
		"major": 0,
		"minor": 1,
		"patch": 2
	},
	original: "",
	updated: ""
};

const utils = {
	incrementVersion: function(version, type, userVersion) {
		type = type || options.type;
		if (typeof userVersion === "string"){
			return userVersion;
		}
		for (let name in options.versionHash){
			if (argv[name]) {
				type = name;
			}
		}
		let no = version.split(options.delimeter);
		let i = options.versionHash[type] + 1;
		++no[options.versionHash[type]];
		for (; i<3; i++) { // in case its not a patch update
			no[i] = 0;
		}
		return no.join(options.delimeter);
	}
};

gulp.task('increment', ['increment:version', 'increment:push'] );

gulp.task('increment:version', function() {
	let json = JSON.parse(fs.readFileSync( options.json ));
	options.original = json.version;

	if (options.original.split("-")[2] === '999') {
		options.type = "minor";
		if (options.original.split("-")[1] === '999') {
			options.type = "major";
		}
	}

	let updated = utils.incrementVersion(json.version, argv.type, argv.version);
	options.updated = json.version = updated;

	fs.writeFile(options.json, JSON.stringify(json, null, 2), 'utf8', function (err) {
		if (err) {
			return console.log(err);
		}
	});
});

gulp.task('increment:commit', function() {
	return gulp.src(options.json)
		.pipe(git.commit(`gulp:increment version number; ${options.original} - ${options.updated}`));
});

gulp.task('increment:getbranch', function(){
	git.revParse({args:'--abbrev-ref HEAD'}, function (err, branch) {
		console.log('current git branch: ' + branch);
		options.branch = branch;
	});
});

gulp.task('increment:push', ['increment:commit','increment:getbranch'], function() {
	let branch = options.branch;
	if (typeof argv.branch === "string"){
		branch = argv.branch;
	}
	git.push('origin', branch, function (err) {
		if (err) {
			return console.log(err);
		}
		if (argv.build) {
			return gulp.start('build');
		}
	});
});
