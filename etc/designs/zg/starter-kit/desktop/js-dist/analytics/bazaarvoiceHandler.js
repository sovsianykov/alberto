(function($) {
	"use strict";

	var api = {};
	var sharedApi = {};
	var events;
	var utils;
	var ctConstants;
	var isRegistered;
	var queryString;
	var COMPONENT_POSITION = "";	//component position is not tracked

	api.init = function() {
		events = this.external.eventsDefinition.OTHER;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		queryString = this.external.querystring;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("bazaarvoice", events.BAZAARVOICE, addBvListeners);
		}
	}

	function addBvListeners() {
		if (!isRegistered) {
			$BV.configure("global", {
				events: {
					submissionSubmitted: function(data) {
						trackSingleEvent(ctConstants.ratingreview, getEventLabel(data),
								ctConstants.advocacy, ctConstants.interest);
					},
					bvRender: function(data) {
						var attributes = {nonInteractive: {nonInteraction: 1}};
						trackSingleEvent(ctConstants.bvrenders, getEventLabel(data),
								ctConstants.custom, ctConstants.read, attributes);
					},
					submissionLoad: function(data) {
						var eventAction = sharedApi.isIntentReview() ? ctConstants.reviewIntentBazaarVoice : ctConstants.bazaarvoicereviewopen;
						trackSingleEvent(eventAction,
								getEventLabel(data), ctConstants.advocacy, ctConstants.interest);
					},
					submissionClose: function(data) {
						trackSingleEvent(ctConstants.bazaarvoicereformcloses,
								getEventLabel(data), ctConstants.advocacy, ctConstants.other);
					}
				}
			});
			isRegistered = true;
		}
	}

	function trackSingleEvent(action, label, category, subcategory, attributes) { //jshint ignore:line
		var analyticsProduct = utils.createProduct();
		analyticsProduct.attributes.integration = "bazaarvoice";
		digitalData.product.unshift(analyticsProduct);
		utils.pushComponent("Bazaarvoice", COMPONENT_POSITION, category, subcategory);
		utils.addTrackedEvent(action, label, category, subcategory, attributes);
	}

	function getEventLabel(data) {
		var product = allProducts[data.Id] || {};
		var title = $('meta[property="og:title"]').attr("content") || "";
		return product.shortTitle || title;
	}

	sharedApi.isIntentReview = function() {
		var intenToBuy = queryString.getFromQueryString("intent");
		if (intenToBuy && intenToBuy.toLowerCase() === "review") {
			return true;
		}
		return false;
	};

	Cog.registerStatic({
		name: "analytics.bazaarvoiceHandler",
		api: api,
		sharedApi: sharedApi,
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
				name: "utils.querystring",
				apiId: "querystring"
			}
		]
	});
}(Cog.jQuery()));
