(function($) {
	"use strict";

	var api = {};
	var events;
	var utils;
	var ctConstants;

	api.init = function() {
		events = this.external.eventsDefinition.LOAD;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			$(document).ready(addComponentsPositionNumber);
			$(document).ready(putRmsPageTitleToDigitalData);
			Cog.addListener("virtualAgent", events.VIRTUAL_AGENT, virtualAgentLoad);
			Cog.addListener("storeLocator", events.STORE_LOCATOR, storeLocatorLoad);
			Cog.addListener("form", events.FORM_PAGE, formPageLoad);
			Cog.addListener("productInfo", events.PRODUCT_INFO,
					productDetailPageLoad);
		}
	}

	function addComponentsPositionNumber() {
		$(".component").each(function(position) {
			$(this).attr("data-position", position);
		});
	}

	function putRmsPageTitleToDigitalData() {
		var recipeTitle = $("title").data("recipe-title");
		if (recipeTitle !== undefined) {
			digitalData.page.attributes.contentType = recipeTitle;
			digitalData.page.category.subCategory2 = recipeTitle;
		}
	}

	function virtualAgentLoad(event) {
		utils.pushComponent("Virtual Agent", event.eventData.componentPosition,
				ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.virtualagent, "Virtual Agent-Launch",
				ctConstants.engagement, ctConstants.interest);
	}

	function storeLocatorLoad(event) {
		utils.pushComponent(ctConstants.storeLocator, event.eventData.position,
				ctConstants.custom, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.storeLocator,
				"Store Locator - Launch Open",
				ctConstants.custom, ctConstants.interest);
	}

	function productDetailPageLoad(event) {
		var productData = {
			EAN: event.eventData.EAN,
			shortTitle: event.eventData.productTitle
		};
		var product = utils.createProduct(productData);
		utils.pushProduct(product);
		utils.pushComponent(ctConstants.productInfo);
		var attributes = {nonInteractive: {nonInteraction: 1}};
		utils.addTrackedEvent(ctConstants.productInfo,
				event.eventData.productTitle,
				ctConstants.other, ctConstants.read, attributes);
	}

	function formPageLoad(event) {
		utils.addTrackedEvent(event.eventData.action, event.eventData.label,
				ctConstants.engagement,
				ctConstants.lead);
	}

	Cog.registerStatic({
		name: "analytics.onLoadHandlers",
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
})(Cog.jQuery());
