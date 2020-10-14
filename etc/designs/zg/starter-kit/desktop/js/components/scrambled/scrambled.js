(function($) {
	"use strict";

	var api = {};
	var analyticsUtils = {};
	var eventsDefinition = {};
	var isIntentLoaded = false;

	var load = function() {
		var scrambledLazyLoad = document.getElementById("scrambled-lazyLoad");
		if (scrambledLazyLoad) {
			scrambledLazyLoad.src = scrambledLazyLoad.getAttribute("data-src");
			scrambledLazyLoad.removeAttribute("data-src");
			scrambledLazyLoad.addEventListener("load", function() {
				Cog.fireEvent("scrambled", "SCRAMBLED_LAZY_LOAD");
			});
		}
	};

	window.runOnWindowLoad(load);

	api.onRegister = function(scope) {
		var $element = scope.$scope;
		var $body = $("body");
		analyticsUtils = this.external.utils;
		eventsDefinition = this.external.eventsDefinition;
		if ("Scrambled" in window) {
			initialiseScrambled();
		} else {
			Cog.addListener("scrambled", "SCRAMBLED_LAZY_LOAD", initialiseScrambled);
		}
		$element.on("click", function() {
			$body.css("overflow","auto");
			Cog.fireEvent("buyitnow", eventsDefinition.CLICK.BIN_CLICK, {
				componentPosition: analyticsUtils.getComponentPosition($element),
				product: $element.attr("data-product-id"),
				component: "Scrambled",
				integration: "Scrambled"
			});
		}.bind(this));
		setTimeout(function() {
			loadBinWidgetIfIntentIsPurchase($element);
		}.bind(this), 1000);

	};

	function loadBinWidgetIfIntentIsPurchase($elem) {
		if (!isIntentLoaded) {
			Cog.fireEvent("buyitnow", eventsDefinition.LOAD.PDP_PAGE_LOAD, {
				element: $elem,
				integration: "Scrambled"
			});
			isIntentLoaded = true;
		}
	}

	function initialiseScrambled() {
		Scrambled.init();
	}

	Cog.registerComponent({
		name: "scrambled",
		api: api,
		selector: ".scrambled",
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]
	});

})(Cog.jQuery());
