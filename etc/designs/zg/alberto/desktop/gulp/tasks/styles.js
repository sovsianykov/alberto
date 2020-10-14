/* jshint node:true */

'use strict';

const path = require('path');
const gulp = require('gulp');
const handleErrors = require('../util/handleErrors');
const sass = require('gulp-sass');
const filter = require('gulp-filter');
const cached = require('gulp-cached');
const postcss = require('gulp-postcss');
const pixelstorem = require('postcss-pixels-to-rem');
const autoprefixer = require('autoprefixer');
const important = require('postcss-important-startstop');
const settings = require('../../package.json');
const rtl = require('postcss-rtl');
const sassInheritance = require('gulp-sass-inheritance');
const isRTL = process.env.npm_package_config_direction === 'rtl';
const cssnano = require('gulp-cssnano');
const gulpSequence = require('gulp-sequence');
const cssnanoConfig = {
	discardUnused: false,   // This rule messes up with our icon font
	safe: true				// Stops cssnano rewriting z-index, animation-name etc... this causes havoc
};
const argv = require('yargs').argv;
const isDev = (argv.dev === undefined) ? false : true;

// convert px to rem (including; font-size and line-height, excluding the below)
const remConversionExclude = [
	"bottom",
	"border",
	"border-top",
	"border-right",
	"border-bottom",
	"border-left",
	"border-radius",
	"border-width",
	"border-top-width",
	"border-right-width",
	"border-bottom-width",
	"border-left-width",
	"box-shadow",
	"height",
	"left",
	"letter-spacing",
	"margin",
	"margin-top",
	"margin-right",
	"margin-bottom",
	"margin-left",
	"max-height",
	"max-width",
	"min-height",
	"min-width",
	"outline",
	"outline-offset",
	"padding",
	"padding-top",
	"padding-right",
	"padding-bottom",
	"padding-left",
	"right",
	"text-indent",
	"top",
	"transform",
	"-webkit-transform",
	"translate",
	"width"
];

gulp.task('cache-styles', function () {
	// task to cache files before watch (to avoid full build on first change)
	return gulp.src('sass/**/*.scss')
		.pipe(cached('sass'));
});

gulp.task('styles:build', function () {
	var postcssOptions = [
		autoprefixer({
			browsers: settings.browserslist
		}),
		important(),
		pixelstorem({
			base: 16,
			unit: "rem",
			mediaQueries: false,
			exclude: remConversionExclude
		})
	];
	if (isRTL) {
		postcssOptions.push(rtl({onlyDirection: 'rtl'}));
	}
	if (isDev) {
		// usage: $ gulp styles --dev // to run styles without cssnano
		return gulp.src('sass/**/*.scss')
			.pipe(cached('sass'))
			.pipe(sassInheritance({dir: 'sass/'}))
			.pipe(filter(function (file) {
				return !/^_/.test(path.basename(file.path));
			}))
			.pipe(sass().on('error', handleErrors))
			.pipe(postcss(postcssOptions))
			.pipe(gulp.dest('css'));
	} else {
		return gulp.src('sass/**/*.scss')
			.pipe(cached('sass'))
			.pipe(sassInheritance({dir: 'sass/'}))
			.pipe(filter(function (file) {
				return !/^_/.test(path.basename(file.path));
			}))
			.pipe(sass().on('error', handleErrors))
			.pipe(postcss(postcssOptions))
			.pipe(cssnano(cssnanoConfig))
			.pipe(gulp.dest('css'));
	}
});

gulp.task('styles', gulpSequence('styles:build', 'concat:lazystyles'));
