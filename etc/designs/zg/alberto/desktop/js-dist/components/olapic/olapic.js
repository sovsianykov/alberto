/**
 * Olapic
 */

(function($) {
	"use strict";

	var api = {};
	var selector = "#olapic_specific_widget";

	//olapic lazy load
	var load = function() {
		var scriptTag = $(selector).siblings("script");
		var scriptDataSrc = scriptTag.attr("data-src");
		if (scriptDataSrc) {
			scriptTag.attr("src", scriptDataSrc);
			scriptTag.removeAttr("data-src");
		}

	};
	window.runOnWindowLoad(load);

	Cog.register({
		name: "olapic",
		api: api,
		selector: ".olapic"
	});

})(Cog.jQuery());
