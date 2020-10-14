(function() {
	"use strict";

	var load = function() {
		var $facebookLazyLoad = document.getElementById("facebook-lazyload");
		var $customerChatLazyLoad = document.getElementById("facebook-jssdk-lazyload");
		if ($facebookLazyLoad && $customerChatLazyLoad) {
			$customerChatLazyLoad.id = "facebook-jssdk";
			[$facebookLazyLoad, $customerChatLazyLoad].forEach(function($el) {
				var src = $el.getAttribute("data-src");
				$el.setAttribute("src",src);
				$el.removeAttribute("data-src");
			});
		}
	};

	window.runOnWindowLoad(load);

})();
