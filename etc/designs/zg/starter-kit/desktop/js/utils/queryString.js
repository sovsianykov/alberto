/**
 * Utils - Getting a param from query string
 */
(function() {
	"use strict";

	var api = {};
	var sharedApi = {};

	sharedApi.getFromQueryString = function(key) {
		key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
		var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
		return match && decodeURIComponent(match[1].replace(/\+/g, " "));
	};

	Cog.registerStatic({
		name: "utils.querystring",
		api: api,
		sharedApi: sharedApi
	});
})(Cog.jQuery());
