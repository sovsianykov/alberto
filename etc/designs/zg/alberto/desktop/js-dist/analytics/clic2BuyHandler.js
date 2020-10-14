(function() {
	"use strict";

	var api = {};
	var events;
	var utils;
	var ctConstants;
	var buyItNowHandler;

	api.init = function() {
		events = this.external.eventsDefinition;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		buyItNowHandler = this.external.buyItNowHandler;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("clic2buy", events.CLICK.CLIC2BUY_BUTTON_CLICK, binButtonClicked);
		}
	}

	function binButtonClicked(event) {
		var analyticsProduct = utils.createProduct();
		analyticsProduct.attributes.integration = event.eventData.integration;
		utils.pushProduct(analyticsProduct);
		utils.pushComponent(event.eventData.componentName, event.eventData.componentPosition,
		ctConstants.conversion, ctConstants.lead);
		var eventAction = buyItNowHandler.setEventActionIfIntent();
		utils.addTrackedEvent(eventAction, event.eventData.eventLabel,
		ctConstants.conversion, ctConstants.lead);
	}

	Cog.registerStatic({
		name: "analytics.clic2BuyHandler",
		api: api,
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			},
			{
				name: "analytics.buyItNowHandler",
				apiId: "buyItNowHandler"
			}
		]
	});
})();
