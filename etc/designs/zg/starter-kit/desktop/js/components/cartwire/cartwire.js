(function() {
	"use strict";
	var api = {};
	var analyticsUtils = {};
	var eventsDefinition = {};

	api.onRegister = function(scope) {
		var $element = scope.$scope;
		var smartProductIdConfigured = $element.attr("data-smart-product-id");
		analyticsUtils = this.external.utils;
		eventsDefinition = this.external.eventsDefinition;
		$element.on("click", function() {
			Cog.fireEvent("buyitnow", eventsDefinition.CLICK.BIN_CLICK, {
				componentPosition: analyticsUtils.getComponentPosition($element),
				product: analyticsUtils.getEanFromSmartProductId(smartProductIdConfigured),
				component: "Cartwire",
				integration: "Cartwire"
			});
		}.bind(this));

		document.addEventListener("cwwidget_open", function(event) {
			var eventDetail = event.detail;
			if (event.detail && typeof event.detail === "string") {
				eventDetail = JSON.parse(event.detail);
			}
			Cog.fireEvent("buyitnow", eventsDefinition.CLICK.CARTWIRE_RETAILER_CLICK, {
				componentPosition: this.componentPosition,
				productId: this.smartProductIdConfigured,
				product: eventDetail,
				retailerClick: true,
				component: "Cartwire",
				integration: "Cartwire"
			});
		}.bind(this));
	};

	var load = function() {
		var cartWireLazyLoadJs = document.getElementById("cartWire-js-lazyLoad");
		if (cartWireLazyLoadJs) {
			cartWireLazyLoadJs.src = cartWireLazyLoadJs.getAttribute("data-src");
			cartWireLazyLoadJs.removeAttribute("data-src");
			cartWireLazyLoadJs.id = "cartWire-js-lazyLoaded";
		}
	};

	window.runOnWindowLoad(load);

	Cog.registerComponent({
		name: "Cartwire",
		api: api,
		selector: ".cartwire",
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
