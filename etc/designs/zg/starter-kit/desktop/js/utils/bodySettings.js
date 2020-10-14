/**
 * Utils - Settings
 * File for setting initials
 */

(function($) {
	"use strict";

	var api = {},
		sharedApi = {};

	api.init = function() {
		// Set external api with data passed on body
		$.extend(sharedApi, $("body").data());
	};

	Cog.registerStatic({
		name: "utils.bodySettings",
		api: api,
		sharedApi: sharedApi
	});
})(Cog.jQuery());
