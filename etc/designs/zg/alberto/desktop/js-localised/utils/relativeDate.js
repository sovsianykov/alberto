/**
 * Modify the date of article so it would be relative
 * like "a day ago, a month ago and etc."
 */

(function($, moment) {
	"use strict";

	var api = {};

	var articlesInfoDate = $(".article-teaser-info .richText-content >*:nth-child(2)");
	var singleArticle = $(".single-article-teaser-info .richText-content >*:nth-child(2)");
	var dateFormat;
	// Check if it's articles landing page
	if (articlesInfoDate.length) {
		dateFormat = "DD-MMM-YYYY";
		articlesInfoDate.each(function() {
			modifyDate($(this), dateFormat);
		});
	// Check if it's a single article page
	} else if (singleArticle.length) {
		dateFormat = "YYYY-MM-DD";
		modifyDate(singleArticle, dateFormat);
	}

	// get single data from string such as (2019-11-11T16:18:41.335Z)
	// withought time
	function returnOnlyDate(rawDate) {
		return rawDate.split("T")[0];
	}

	function modifyDate(rawDate, dateFormat) {
		if (!$(rawDate).hasClass("dataModified")) {
			var date = $(rawDate).text();
			$(rawDate).text(moment(returnOnlyDate(date), dateFormat).fromNow());
			$(rawDate).addClass("dataModified");
		}
	}

	Cog.registerStatic({
		name: "utils.relativeDate",
		api: api
	});
})(Cog.jQuery(), window.moment);
