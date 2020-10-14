(function($) {
	"use strict";

	var SELECTORS = {
		botIcon: "#BotExpand",
		iconToggle: "iconToggle"
	};
	
	var load = function() {
		var $ccoreLazyLoadJs = document.getElementById("getokenfromlink");
		var $ccoreLazyLoadCss = document.getElementById("ccore-lazyload-css");
		var $ccoreSkinCss = document.getElementById("ccore-skin-css");
		if ($ccoreLazyLoadJs && $ccoreLazyLoadCss && $ccoreSkinCss) {
			replaceDataProperty($ccoreLazyLoadJs, "data-src", "src");
			replaceDataProperty($ccoreLazyLoadCss, "data-href", "href");
			replaceDataProperty($ccoreSkinCss, "data-href", "href");
		}
	};

	function replaceDataProperty($el, attribToBeReplaced, replacingAttrib) {
		var attrib = $el.getAttribute(attribToBeReplaced);
		$el.setAttribute(replacingAttrib, attrib);
		$el.removeAttribute(attribToBeReplaced);
	}

	window.runOnWindowLoad(load);

	$(document).on("click", SELECTORS.botIcon, function() {
		if ($(this).hasClass(SELECTORS.iconToggle)) {
			Cog.fireEvent("chatBot","chatBotAnalytics");
		}
	});

})(Cog.jQuery());
