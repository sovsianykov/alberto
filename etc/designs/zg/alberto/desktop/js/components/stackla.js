(function() {
	"use strict";

	var load = function() {
		var stacklaLazyLoad = document.getElementById("stackla-lazyLoad");
		if (stacklaLazyLoad) {
			stacklaLazyLoad.src = stacklaLazyLoad.getAttribute("data-src");
			stacklaLazyLoad.removeAttribute("data-src");
		}
	};
	window.runOnWindowLoad(load);

})(Cog.jQuery());
