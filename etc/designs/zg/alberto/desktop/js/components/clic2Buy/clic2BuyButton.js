(function() {
	"use strict";

	var analyticsDef;
	var analyticsUtils;
	var isIntentLoaded;

	function Clic2BuyButton($el) {
		this.$el = $el;
		this.$button = this.$el.find(".clic2buy-buy-it-now-btn");
		this.$productEan = this.$button.closest("div[data-widget-ean]").attr("data-widget-ean");
		this.componentPosition = analyticsUtils.getComponentPosition($el);
		this.addHandlers();
		this.loadBinWidgetIfIntentIsPurchase();
	}

	Clic2BuyButton.prototype = {
		addHandlers: function() {
			this.$button.on("click", function() {
				this.trackClick();
			}.bind(this));
		},

		trackClick: function() {
			var productDetails = digitalData.product;
			var matchedResults = productDetails.filter(function(product) {
				return product.productInfo.productID === this.$productEan;
			}.bind(this));

			var productName = "";
			if (matchedResults.length > 0) {
				productName = "Online - " + matchedResults[0].productInfo.productName;
			}

			Cog.fireEvent("clic2buy", analyticsDef.CLICK.CLIC2BUY_BUTTON_CLICK, {
				componentPosition: this.componentPosition,
				componentName: analyticsDef.ctConstants.clic2buy,
				eventLabel: productName,
				integration: "Clic2buy"
			});
		},

		loadBinWidgetIfIntentIsPurchase: function() {
			if (!isIntentLoaded) {
				setTimeout(function() {
					Cog.fireEvent("buyitnow", analyticsDef.LOAD.PDP_PAGE_LOAD, {
						element: this.$button,
						integration: "Clic2buy"
					});
					isIntentLoaded = true;
				}.bind(this), 2000);
			}
		}
	};

	var load = function() {
		var clic2BuyLazyLoadJs = document.getElementById("clic2Buy-js-lazyLoad");
		if (clic2BuyLazyLoadJs) {
			clic2BuyLazyLoadJs.src = clic2BuyLazyLoadJs.getAttribute("data-src");
			clic2BuyLazyLoadJs.removeAttribute("data-src");
			clic2BuyLazyLoadJs.id = "clic2Buy-js-lazyLoaded";
			clic2BuyLazyLoadJs.addEventListener("load", function() {
				Cog.fireEvent("clic2BuyLazyLoad", "C2B_LAZY_LOAD");
			}, true);
		}
	};
	window.runOnWindowLoad(load);

	var api = {
		onRegister: function(scope) {
			analyticsDef = this.external.eventsDefinition;
			analyticsUtils = this.external.utils;
			new Clic2BuyButton(scope.$scope);
		},
		init: function() {
			if ("c2bWidget" in window) {
				c2bWidget.init();
			}
			Cog.addListener("clic2BuyLazyLoad", "C2B_LAZY_LOAD", function() {
				c2bWidget.init();
			});
			Cog.addListener("showMore", "REVEAL_NEXT", function() {
				c2bWidget.init();
			});
		}
	};

	Cog.registerComponent({
		name: "clic2Buy",
		api: api,
		selector: ".clic2buy",
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
