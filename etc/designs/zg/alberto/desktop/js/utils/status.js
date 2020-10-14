/**
 * Status - get current page status
 */

(function($) {
	"use strict";

	var api = {};
	var	cache = {};
	var	sharedApi = {};
	var	loaded = false;
	var load = function() {
		loaded = true;
	};

	window.runOnWindowLoad(load);

	sharedApi.isAuthor = function() {
		if (typeof cache.isAuthor === "undefined") {
			cache.isAuthor = $("body").is(".cq-wcm-edit, .cq-wcm-edit-touch");
		}

		return cache.isAuthor;
	};

	sharedApi.isLoaded = function() {
		return loaded;
	};

	sharedApi.isPublish = function() {
		return !sharedApi.isAuthor();
	};

	Cog.registerStatic({
		name: "utils.status",
		api: api,
		sharedApi: sharedApi
	});
})(Cog.jQuery());
