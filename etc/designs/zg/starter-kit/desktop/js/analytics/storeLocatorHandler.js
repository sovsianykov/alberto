(function() {
	"use strict";

	var api = {};
	var events;
	var utils;
	var ctConstants;

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("storeLocator", events.CLICK.STORE_LOCATOR_EDIT, onSearchEdit);
			Cog.addListener("storeLocator", events.CLICK.STORE_LOCATOR_CTA, onCtaClicked);
			Cog.addListener("storeLocator", events.SUBMIT.STORE_LOCATOR, onFormSubmitted);
			Cog.addListener("storeLocator", events.OTHER.STORE_LOCATOR_RESULTS, onSearchResult);
			Cog.addListener("storeLocator", events.OTHER.STORE_LOCATOR_OPTIONS, onOptionsChanged);
		}
	}

	function onCtaClicked(event) {
		var label = ctConstants.callToAction + " - " + event.eventData.label;
		pushStoreLocatorEvent(
			ctConstants.clicktoaction,
			label,
			ctConstants.engagement,
			ctConstants.read,
			event.eventData.position
		);
	}

	function onOptionsChanged(event) {
		var label = "Store Locator Options - " + event.eventData.label;
		pushStoreLocatorEvent(
			ctConstants.storeLocator,
			label,
			ctConstants.custom,
			ctConstants.lead,
			event.eventData.position
		);
	}

	function onFormSubmitted(event) {
		var eventLabel = "StoreSearchSubmitted " + event.eventData.zipCode;
		pushStoreLocatorEvent(
			ctConstants.storesearch,
			eventLabel,
			ctConstants.custom,
			ctConstants.interest,
			event.eventData.position
		);
	}

	function onSearchEdit(event) {
		var eventLabel = "StoreSearchEdit";
		pushStoreLocatorEvent(
			ctConstants.storeLocator,
			eventLabel,
			ctConstants.custom,
			ctConstants.win,
			event.eventData.componentPosition);
	}

	function onSearchResult(event) {
		var eventLabel = "Store Locator Results - " + event.eventData.resultsNumber;
		pushStoreLocatorEvent(
			ctConstants.storeLocator,
			eventLabel,
			ctConstants.custom,
			ctConstants.win,
			event.eventData.componentPosition);
	}

	function pushStoreLocatorEvent(action, label, category, subcategory, position) { /* jshint ignore:line */
		utils.pushComponent(
			ctConstants.storeLocator,
			position,
			category,
			subcategory
		);
		utils.addTrackedEvent(
			action,
			label,
			category,
			subcategory
		);
	}

	api.init = function() {
		events = this.external.eventsDefinition;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		addEventListeners();
	};

	Cog.registerStatic({
		name: "analytics.storeLocatorHandler",
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
}());