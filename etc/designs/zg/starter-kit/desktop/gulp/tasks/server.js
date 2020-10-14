/* jshint node:true */

'use strict';

const gulp = require('gulp');
const localWebServer = require('local-web-server');
const path = require('path');

gulp.task('server', ['dev'], function () {
	var contentDir = "../../../../../",
		mockDir = path.resolve('mock'),
		formattedMockDir = mockDir.substring(mockDir.indexOf('etc')-1).replace(/\\/g,"/"),
		wsOptions = {
			rewrite: [
				{
					from: "*.lightbox.html",
					to: "$1.html"
				},
				{
					from: "*/product-quick-view.*.html",
					to: "$1/creative-exchange/product-quick-view.html"
				},
				{
					from: "*/where-to-buy/_jcr_content/*.html",
          			to: formattedMockDir + "/listing.html"
				},
				{
					from: "/quiz-ce*/_jcr_content/content.html*",
					to: "$1.html"
				}
			],
			static: {
				root: contentDir
			},
			serveIndex: {
				path: contentDir
			}
		};

	localWebServer(wsOptions).listen(8000);
});
