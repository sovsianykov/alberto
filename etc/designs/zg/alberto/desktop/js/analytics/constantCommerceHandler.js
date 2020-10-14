(function() {
	"use strict";

	var api = {};
	var events;
	var utils;
	var ctConstants;

	api.init = function() {
		events = this.external.eventsDefinition;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("constantCommerce", events.CLICK.CONSTANT_COMMERCE_BUTTON_CLICK, binButtonClicked);
		}
	}

	function binButtonClicked(event) {
		utils.pushComponent(event.eventData.componentName, event.eventData.componentPosition,
		ctConstants.conversion, ctConstants.lead);
		utils.addTrackedEvent(ctConstants.purchase, event.eventData.eventLabel,
		ctConstants.conversion, ctConstants.lead);
	}

	Cog.registerStatic({
		name: "analytics.constantCommerceHandler",
		api: api,
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
})();
