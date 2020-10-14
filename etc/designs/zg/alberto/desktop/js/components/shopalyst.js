(function() {
	"use strict";

	var api = {};
	var analyticsUtils = {};
	var eventsDefinition = {};
	var isIntentLoaded;
	var load = function() {
		var shopalystLazyLoad = document.getElementById("shopalyst-lazyLoad");
		if (shopalystLazyLoad) {
			var src = shopalystLazyLoad.getAttribute("data-src");
			shopalystLazyLoad.setAttribute("src", src);
			shopalystLazyLoad.removeAttribute("data-src");
			shopalystLazyLoad.addEventListener("load", function() {
				_shopalyst.init(shopalyst.publisherId, shopalyst.placementId, shopalyst.campaignId);
				Cog.fireEvent("shopalystLazyLoad", "SHOPALYST_LAZY_LOAD");
			});
		}
	};
	window.runOnWindowLoad(load);

	function Shopalyst($el) {
		this.$el = $el;
		this.showButton = $el.data("show-button");
		this.type = $el.data("type");
		this.placeholderId = $el.data("placeholder-id");
		this.eanNumber = $el.data("ean");
		this.$button = $el.find(".shopalyst-btn");
		this.shopalystProperties = {
			type: this.type
		};
		this.container = {
			"container": "#" + this.placeholderId
		};
		if (typeof this.showButton !== "undefined") {
			this.init();
		}
	}

	Shopalyst.prototype = {
		init: function() {
			if (this.showButton) {
				this.validate();
				this.bindUIEvents();
			} else {
				this.show();
				// event is fired from Shopalyst and is embedded in Google Tag Manager
				window.addEventListener("message", function(message) {
					var data;
					if (message && message.data && message.origin.match("(shortlyst)?(shopalyst)?")) {
						data = message.data;
						if (data && data.event === "merchant_clicked" && data.productId) {
							var productId = parseInt(data.productId, 10);
							if (productId === this.eanNumber) {
								Cog.fireEvent("shopalyst", eventsDefinition.ctConstants.shopalystRetailerClicked, {
									productEan: data.productId,
									position: analyticsUtils.getComponentPosition(this.$el),
									integration: "Shopalyst"
								});
							}
						}
					}
				}.bind(this));
			}
			this.loadBinWidgetIfIntentIsPurchase();
		},
		show: function() {
			if (typeof _shopalyst !== "undefined") {
				switch (this.type) {
					case "merchantSelector":
						_shopalyst.addEANToCart(this.eanNumber);
						break;
					case "merchantWidget":	//jshint ignore:line
					default:
						_shopalyst.openBinWidget(this.eanNumber, this.container, this.shopalystProperties);
						break;
				}
			}
		},
		validate: function() {
			if (typeof this.eanNumber === "undefined" || typeof this.placeholderId === "undefined" || typeof this.type === "undefined") {
				this.$button.attr("disabled", true);
			}
		},
		bindUIEvents: function() {
			this.$button.bind("click", function(event) {
				event.preventDefault();
				this.show();
			}.bind(this));
		},
		loadBinWidgetIfIntentIsPurchase: function() {
			if (!isIntentLoaded) {
				if (this.showButton) {
					setTimeout(function() {
						Cog.fireEvent("buyitnow", eventsDefinition.LOAD.PDP_PAGE_LOAD, {
							element: this.$button,
							integration: "Shopalyst"
						});
					}.bind(this), 0);
				} else {
					Cog.fireEvent("buyitnow", eventsDefinition.LOAD.PDP_PAGE_LOAD, {
						componentPosition: analyticsUtils.getComponentPosition(this.$button),
						product: this.eanNumber,
						component: "Shopalyst",
						integration: "Shopalyst"
					});
				}
				isIntentLoaded = true;
			}
		}
	};

	api.onRegister = function(scope) {
		if (typeof _shopalyst !== "undefined") {
			new Shopalyst(scope.$scope);
		} else {
			Cog.addListener("shopalystLazyLoad", "SHOPALYST_LAZY_LOAD", function() {
				new Shopalyst(scope.$scope);
			}.bind(this));
		}
	};

	api.init = function() {
		analyticsUtils = this.external.utils;
		eventsDefinition = this.external.eventsDefinition;
		Cog.addListener("shopalyst", eventsDefinition.ctConstants.shopalystRetailerClicked, function(e) {
			if (e.eventData && e.eventData.productEan) {
				Cog.fireEvent("buyitnow", eventsDefinition.CLICK.BIN_CLICK, {
					componentPosition: e.eventData.position,
					product: e.eventData.productEan,
					component: "Shopalyst",
					integration: "Shopalyst"
				});
			}
		});
	};

	Cog.registerComponent({
		name: "shopalyst",
		api: api,
		selector: ".shopalyst",
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
