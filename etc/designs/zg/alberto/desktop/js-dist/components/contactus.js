(function($) {
	"use strict";

	var load = function() {
		var scriptTag = document.getElementById("contactus-js-lazyLoad");
		if (scriptTag) {
			$(scriptTag).attr("src", $(scriptTag).attr("data-src"));
			$(scriptTag).attr("async", true);
			$(scriptTag).removeAttr("data-src");
		}
	};
	window.runOnWindowLoad(load);
})(Cog.jQuery());
