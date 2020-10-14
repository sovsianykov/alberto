/* jshint node:true */

'use strict';

const notify = require('gulp-notify');
const argv = require('yargs').argv;

module.exports = function () {
	var args = Array.prototype.slice.call(arguments);

	// Sends error to notification center with gulp-notify
	console.log(arguments);
	notify.onError({
		title: 'Compile Error',
		message: '<%= error %>'
	}).apply(this, args);

	if (!argv.preCommit) {
		this.emit('end');
	}
};
