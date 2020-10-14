/**
 * Shoppable lazy load
 */

(function($) {
	"use strict";

	var api = {};
	var retries = 0;
	var MAX_RETRIES = 10;
	var DELAY_MS = 100;

	api.init = function() {
		var load = function() {
			var $shoppableLazyLoadJs = $("#shoppable-js-lazyLoad");
			var $shoppableLazyLoadCss = $("#shoppable-css-lazyLoad");
			var options;

			if ($shoppableLazyLoadJs && $("#shoppable_bundle").length === 0) {
				options = $shoppableLazyLoadJs.attr("data-options");

				if (options) {
					// 'options' attribute is expected by shoppable
					// if options have been added as 'data-options' attribute (to be WCAG compliant) then copy to options
					$shoppableLazyLoadJs.attr("options", options);
				}
				$shoppableLazyLoadJs.attr("id", "shoppable_bundle");
				$shoppableLazyLoadJs.attr("src", $shoppableLazyLoadJs.attr("data-src"));
				api.waitForShoppableScript();
			}

			if ($shoppableLazyLoadCss) {
				$shoppableLazyLoadCss.attr("href",
					$shoppableLazyLoadCss.attr("data-href"));
				$shoppableLazyLoadCss.removeAttr("id");
			}
		};
		window.runOnWindowLoad(load);
	};

	api.waitForShoppableScript = function() {
		if (typeof jQuery.Topic !== "undefined") {
			Cog.fireEvent("shoppable", "SHOPPABLE_LAZY_LOAD");
		} else if (retries < MAX_RETRIES) {
			retries++;
			setTimeout(api.waitForShoppableScript, DELAY_MS);
		}
	};

	Cog.registerStatic({
		name: "shoppable.lazyLoading",
		api: api,
		requires: []
	});

}(Cog.jQuery()));
