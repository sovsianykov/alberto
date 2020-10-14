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
			Cog.addListener("recipeListing", events.CLICK.CAROUSEL_CLICK, carouselClick);
			Cog.addListener("recipeListing", events.CLICK.LOAD_MORE_CLICK, loadMoreClick);
			Cog.addListener("recipeListing", events.CHANGE.FILTER_CHANGE, filterChange);
			Cog.addListener("recipeListing", events.CLICK.LINK_CLICK, recipeClick);
		}
	}

	function carouselClick(event) {
		var label = event.eventData.navDirect + " - " + digitalData.page.pageInfo.destinationURL;
		utils.pushComponent("Recipe Listing", event.eventData.componentPosition, ctConstants.engagement, ctConstants.read);
		utils.addTrackedEvent(ctConstants.carouselClick, label, ctConstants.engagement, ctConstants.read);
	}

	function loadMoreClick(event) {
		utils.pushComponent("Recipe Listing", event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.loadMore, "Recipes", ctConstants.engagement, ctConstants.interest);
	}

	function filterChange(event) {
		var label = event.eventData.eventLabel;
		utils.pushComponent("Recipe Listing", event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.filter, label, ctConstants.engagement, ctConstants.interest);
	}

	function recipeClick(event) {
		var label = event.eventData.componentName + " - " + event.eventData.recipeTitle + " - " + event.eventData.recipeUrl;
		utils.pushComponent("Recipe Listing", event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.recipeClick, label, ctConstants.engagement, ctConstants.interest);
	}

	Cog.registerStatic({
		name: "analytics.rmsHandler",
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
