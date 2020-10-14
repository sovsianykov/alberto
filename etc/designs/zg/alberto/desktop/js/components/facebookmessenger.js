(function() {
	"use strict";

	var LAZYLOAD_SCRIPT_ID = "facebookmessenger-lazyload";

	var load = function() {
		var $messengerLazyload = document.getElementById(LAZYLOAD_SCRIPT_ID);
		if ($messengerLazyload) {
			var src = $messengerLazyload.getAttribute("data-src");
			$messengerLazyload.setAttribute("src", src);
			$messengerLazyload.removeAttribute("data-src");
		}
	};

	window.runOnWindowLoad(load);

})();
