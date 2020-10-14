(function() {
	"use strict";
	var api = {};
	var analyticsUtils = {};
	var priceSpiderListnersregistered = false;
	var priceSpiderRegistered = false;
	var eventsDef;

	var load = function() {
		var priceSpiderLazyLoad = document.getElementById("pricespider-lazyLoad");
		if (priceSpiderLazyLoad) {
			priceSpiderLazyLoad.src = priceSpiderLazyLoad.getAttribute("data-src");
			priceSpiderLazyLoad.removeAttribute("data-src");
			priceSpiderLazyLoad.addEventListener("load", function() {
				var priceSpiderElement = document.getElementsByClassName("ps-widget")[0];
				if (priceSpiderElement) {
					if (priceSpiderRegistered) {
						Cog.fireEvent("priceSpider", "PRICE_SPIDER_LAZY_LOAD");
						Cog.fireEvent("buyitnow", eventsDef.LOAD.PDP_PAGE_LOAD, {
							element: priceSpiderElement,
							component: "PriceSpider",
							integration: "PriceSpider"
						});
					} else {
						var psWidgetInterval = setInterval(function() {
							if (priceSpiderRegistered) {
								Cog.fireEvent("priceSpider", "PRICE_SPIDER_LAZY_LOAD");
								Cog.fireEvent("buyitnow", eventsDef.LOAD.PDP_PAGE_LOAD, {
									element: priceSpiderElement,
									component: "PriceSpider",
									integration: "PriceSpider"
								});
								clearInterval(psWidgetInterval);
							}
						},500);
					}
				}
			});
		}
	};

	function PriceSpiderWidget($el) {
		this.$el = $el;
		this.componentPosition = analyticsUtils.getComponentPosition(this.$el.closest(".buyitnow"));
		this.productId = this.$el.attr("data-product-id");
		this.intialisePriceSpider();
		
		if (!priceSpiderListnersregistered) {
			priceSpiderListnersregistered = true;
			document.addEventListener("wtb_open", function() {
				Cog.fireEvent("priceSpider", "priceSpiderBINClick", {
					componentPosition: this.componentPosition,
					productId: this.productId,
					integration: "PriceSpider"
				});
			}.bind(this));

			document.addEventListener("wtb_redirect", function(e) {
				var eventDetails = e.detail;
				Cog.fireEvent("priceSpider", "sellerRedirectionClick", {
					componentPosition: this.componentPosition,
					productDetails: eventDetails,
					integration: "PriceSpider"
				});
			}.bind(this));

			document.addEventListener("wtb_selector", function(e) {
				Cog.fireEvent("priceSpider", "sizeVariantsClick", {
					componentPosition: this.componentPosition,
					productDetails: e.detail,
					integration: "PriceSpider"
				});
			}.bind(this));

			document.addEventListener("wtb_directions", function(e) {
				Cog.fireEvent("priceSpider", "directionLinkClick", {
					componentPosition: this.componentPosition,
					productDetails: e.detail,
					integration: "PriceSpider"
				});
			}.bind(this));
		}
	}

	PriceSpiderWidget.prototype = {
		intialisePriceSpider: function() {
			PriceSpider.rebind();
		}
	};

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;
		eventsDef = this.external.eventsDefinition;
		priceSpiderRegistered = true;
		Cog.addListener("priceSpider", "PRICE_SPIDER_LAZY_LOAD", function() {
			new PriceSpiderWidget(scope.$scope);
		});
	};
	window.runOnWindowLoad(load);

	Cog.registerComponent({
		name: "pricespider",
		api: api,
		selector: ".pricespider",
		requires: [{
				name: "analytics.utils",
				apiId: "utils"
			},
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			}]
	});
})();
