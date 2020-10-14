(function($) {
	"use strict";

	var api = {},
		sharedApi = {};

	api.init = function() {
		var market = $("meta[name='market']").attr("content");
		var language = $("meta[name='language']").attr("content");

		if (market) {
			Cog.Cookie.create("country", market);
		}
		if (language) {
			Cog.Cookie.create("language", language);
		}
	};

	Cog.registerStatic({
		name: "utils.geolocation",
		api: api,
		sharedApi: sharedApi
	});

})(Cog.jQuery());
