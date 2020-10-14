(function($) {
	"use strict";

	//miappi lazy load
	var load = function() {
		var scriptTag = document.getElementById("miappijs-lazyLoad");
		if (scriptTag) {
			$(scriptTag).attr("id", "_mpi_js_embed_script");
			$(scriptTag).attr("src", $(scriptTag).attr("data-src"));
			$(scriptTag).attr("async", true);
			$(scriptTag).removeAttr("data-src");
		}
	};
	window.runOnWindowLoad(load);
})(Cog.jQuery());
