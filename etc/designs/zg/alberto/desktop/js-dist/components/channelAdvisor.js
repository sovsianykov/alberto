(function() {
	"use strict";

	var api = {};
	var eventsDefinition = {};
	var analyticsUtils = {};
	var classes = { 
		isHidden: "is-hidden",
		positionBottom: "position-bottom"
	};
	var isIntentLoaded = false;

	function ChannelAdvisor($el) {
		this.$btnBuyItNow = $el.children(".channelAdvisor-buy-it-now-btn");
		this.$retailersPopup = $el.children(".channelAdvisor-popup");
		this.$btnClosePopup = this.$retailersPopup.children(".channelAdvisor-close-btn");
		this.bindUIEvents();
		this.loadBinWidgetIfIntentIsPurchase();

		if (typeof this.$btnBuyItNow.offset() !== "undefined" && this.$btnBuyItNow.offset().top < this.$retailersPopup.height()) {
			this.$retailersPopup
				.addClass(classes.positionBottom)
				.css({
					top: $el.height()
				});
		}

	}

	ChannelAdvisor.prototype.bindUIEvents = function() {
		this.$btnBuyItNow.on("click", function() {
			this.$retailersPopup.toggleClass(classes.isHidden);
			Cog.fireEvent("buyitnow", eventsDefinition.CLICK.BIN_CLICK, {
				componentPosition: analyticsUtils.getComponentPosition(this.$btnBuyItNow),
				product: this.$btnBuyItNow.attr("data-ean"),
				component: "Channel Advisor",
				integration: "Channel Advisor"
			});
		}.bind(this));

		this.$btnClosePopup.on("click", function() {
			this.$retailersPopup.addClass(classes.isHidden);
		}.bind(this));
	};

	ChannelAdvisor.prototype.loadBinWidgetIfIntentIsPurchase = function() {
		if (!isIntentLoaded) {
			Cog.fireEvent("buyitnow", eventsDefinition.LOAD.PDP_PAGE_LOAD, {
				element: this.$btnBuyItNow,
				integration: "Channel Advisor"
			});
			isIntentLoaded = true;
		}
	};

	api.onRegister = function(scope) {
		eventsDefinition = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		new ChannelAdvisor(scope.$scope);
	};

	Cog.registerComponent({
		name: "channelAdvisor",
		api: api,
		selector: ".channelAdvisor",
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
}());
