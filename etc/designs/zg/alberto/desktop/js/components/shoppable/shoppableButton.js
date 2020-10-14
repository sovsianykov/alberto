(function($) {
	"use strict";

	var api = {};
	var eventsDef = {};
	var utils = {};
	var shoppablePDPSelectors = {
		"closeButton": ".shoppable-item-close-button",
		"pdpContainer": "#shoppable_pdp_container",
		"quickviewContainer": ".quickview-container"
	};
	var isIntentLoaded = false;

	function ShoppableButton($addToBagBtn, focusTrap) {
		this.$button = $addToBagBtn;
		this.eanNumber = $addToBagBtn.data("ean");
		this.focusTrap = focusTrap.focusTrap;
		this.init($addToBagBtn);
		this.validate();
		this.bindUIEvents();
		this.loadBinWidgetIfIntentIsPurchase();
		
	}

	ShoppableButton.prototype = {
		init: function($addToBagBtn) {
			this.idType = $addToBagBtn.data("idtype");
			this.eanNumber = $addToBagBtn.data("ean");

			if (this.$button.closest(".quickview-container.is-active").length) {
				Cog.addListener("variantList", "variantChanged", function(e) {
					this.eanNumber = e.eventData.ean;
					this.$button.attr("data-ean", this.eanNumber);
				}.bind(this));
			}
		},
		validate: function() {
			if (typeof this.eanNumber === "undefined" || typeof this.idType === "undefined") {
				this.$button.attr("disabled", true);
			}
		},
		bindUIEvents: function() {
			this.$button.bind("click", function() {
				if (typeof Product !== "undefined") {
					Product.pop_pdp(this.idType, this.eanNumber, "addProduct");

					var loaderStatus = setInterval(function() {
						if ($("div[ng-show='showSpinner']").hasClass("ng-hide")) {
							var $container = $(shoppablePDPSelectors.pdpContainer);
							var $firstSelector = $(shoppablePDPSelectors.closeButton);
							this.focusTrap($container, $firstSelector);
							clearInterval(loaderStatus);
						}
					}.bind(this), 1000);
				}
				Cog.fireEvent("buyitnow", eventsDef.CLICK.BIN_CLICK, {
					componentPosition: utils.getComponentPosition(this.$button),
					product: this.eanNumber,
					component: "Shoppable",
					integration: "Shoppable"
				});
			}.bind(this));
		},

		loadBinWidgetIfIntentIsPurchase: function() {
			if (!isIntentLoaded) {
				setTimeout(function() {
					Cog.fireEvent("buyitnow", eventsDef.LOAD.PDP_PAGE_LOAD, {
						element: this.$button,
						integration: "Shoppable"
					});
					isIntentLoaded = true;
				}.bind(this), 0);
			}
		}
	};

	api.onRegister = function(scope) {
		var $el = scope.$scope;
		var	$addToBagBtn = $el.find(".addtobag-btn");
		eventsDef = this.external.eventsDefinition;
		utils = this.external.utils;

		if ($addToBagBtn.length > 0 && "ShoppableApi" in window) {
			new ShoppableButton($addToBagBtn, this.external.focusTrap);
		} else {
			Cog.addListener("shoppable", "SHOPPABLE_LAZY_LOAD", function() {
				$addToBagBtn = $el.find(".addtobag-btn");
				new ShoppableButton($addToBagBtn, this.external.focusTrap);
			}.bind(this));
		}
	};

	Cog.registerComponent({
		name: "shoppable",
		api: api,
		selector: ".shoppable",
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
})(Cog.jQuery());
