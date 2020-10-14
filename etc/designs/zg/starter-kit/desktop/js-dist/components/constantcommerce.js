(function($,document) {
	"use strict";

	var api = {};
	var analyticsUtils;
	var eventsDefinition;

	var load = function() {
		var constantCommerceLazyLoad = document.getElementById("constantCommerce-lazyLoad");
		if (constantCommerceLazyLoad) {
			var src = constantCommerceLazyLoad.getAttribute("data-src");
			constantCommerceLazyLoad.src = src;
			constantCommerceLazyLoad.removeAttribute("data-src");
		}
	};
	window.runOnWindowLoad(load);

	function ConstantCommerce($el) {
		this.$el = $el;
		this.$element = this.$el.find(".cc-smart-product-button");
		if (this.$element.length > 0) {
			this.smartProductIdConfigured = this.$element.attr("data-smart-product-id");
			this.componentPosition = analyticsUtils.getComponentPosition(this.$el);
			this.ccIframeEvents();
		}
	}

	ConstantCommerce.prototype = {
		getProductNameFromId: function() {
			var productDetails = digitalData.product;
			var eanNumber = analyticsUtils.getEanFromSmartProductId(this.smartProductIdConfigured);
			var matchedResults = productDetails.filter(function(product) {
				return product.productInfo.productID === eanNumber;
			}.bind(this));
			if (matchedResults.length > 0) {
				return "Online - " + matchedResults[0].productInfo.productName;
			}
		},
		ccIframeEvents: function() {
			var productName = this.getProductNameFromId();
			var componentPosition = this.componentPosition;
			window.addEventListener("message", function(message) {
				var data;
				if (message && message.data && message.origin.match("constant.co")) {
					data = message.data;
					try {
						if (typeof message.data === "string") {
							data = JSON.parse(message.data);
						}
					} catch (e) {
						console.error("data: cannot be parsed", message.data);
					}

					if (data && data.action === "open-overlay") {
						Cog.fireEvent("constantCommerce", eventsDefinition.CLICK.CONSTANT_COMMERCE_BUTTON_CLICK, {
							componentPosition: componentPosition,
							componentName: eventsDefinition.ctConstants.constantCommerce,
							eventLabel: productName
						});
					}
				}
			});
		}
	};

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;
		eventsDefinition = this.external.eventsDefinition;
		new ConstantCommerce(scope.$scope);
	};

	Cog.registerComponent({
		name: "BuyItNowConstantCommerce",
		api: api,
		selector: ".buyitnow",
		requires: [{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			},
			{
				name: "utils.focusTrap",
				apiId: "focusTrap"
			}
		]
	});

})(Cog.jQuery(),document);
