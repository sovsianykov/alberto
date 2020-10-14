(function() {
	"use strict";

	var api = {};
	var analyticsUtils = {};
	var eventsDefinition = {};

	var load = function() {
		var shopalystLazyLoad = document.getElementById("shopalyst-lazyLoad");
		if (shopalystLazyLoad) {
			var src = shopalystLazyLoad.getAttribute("data-src");
			shopalystLazyLoad.setAttribute("src",src);
			shopalystLazyLoad.removeAttribute("data-src");
			shopalystLazyLoad.addEventListener("load", function() {
				_shopalyst.init(shopalyst.publisherId, shopalyst.placementId, shopalyst.campaignId);
			});
		}
	};
	window.runOnWindowLoad(load);

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;
		eventsDefinition = this.external.eventsDefinition;
		var $element = scope.$scope;
		var $mainParentBox = $element.closest(".buy-it-now-shopalyst-provider");
		var $shopalystWrapper = $element.closest("div[data-ean]");

		$element.on("click", function() {
			$mainParentBox.addClass("shopalyst-active");
			Cog.fireEvent("buyitnow", eventsDefinition.CLICK.BIN_CLICK, {
				componentPosition: analyticsUtils.getComponentPosition($element),
				product: $shopalystWrapper.attr("data-ean"),
				component: "Shopalyst",
				integration: "Shopalyst"
			});
		});
	};

	Cog.registerComponent({
		name: "buy-it-now-shopalyst",
		api: api,
		selector: ".shopalyst-btn",
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
