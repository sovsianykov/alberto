(function() {
	"use strict";

	var api = {};
	var events;
	var utils;
	var ctConstants;
	var isRegistered;

	api.init = function() {
		events = this.external.eventsDefinition;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			addListeners();
		}
	}

	function addListeners() {
		if (!isRegistered) {
			Cog.addListener("kritique", events.CLICK.KRITIQUE_HELPFUL, ratingReviews.events.rrHelpful);
			Cog.addListener("kritique", events.CLICK.KRITIQUE_UNHELPFUL, ratingReviews.events.rrUnHelpful);
			Cog.addListener("kritique", events.CLICK.KRITIQUE_READ_REVIEWS, ratingReviews.events.rrReview);
			Cog.addListener("kritique", events.CLICK.KRITIQUE_REPORT, ratingReviews.events.rrReported);
			Cog.addListener("kritique", events.CLICK.KRITIQUE_WIDGET_CLOSE, ratingReviews.events.rrFormClose);
			Cog.addListener("kritique", events.CLICK.KRITIQUE_WRITE_REVIEW, ratingReviews.events.rrWriteReview);
			Cog.addListener("kritique", events.SUBMIT.KRITIQUE_FORM, ratingReviews.events.rrSubmitReview);
			Cog.addListener("kritique", events.OTHER.KRITIQUE_RENDERER, ratingReviews.events.rrRender);
			Cog.addListener("kritique", events.LOAD.PDP_PAGE_LOAD, ratingReviews.events.rrIntentReview);
			isRegistered = true;
		}
	}

	var ratingReviews = {
		events: {
			rrRender: function(event) {
				trackSingleEvent(
					ctConstants.rrRenders,
					event.eventData.label,
					ctConstants.custom,
					ctConstants.read, {
						position: event.eventData.position,
						nonInteractive: {
							nonInteraction: 1
						}
					}
				);
			},
			rrWriteReview: function(event) {
				trackSingleEvent(
					ctConstants.rrOpen,
					event.eventData.label,
					ctConstants.engagement,
					ctConstants.interest, {
						position: event.eventData.position
					}
				);
			},
			rrFormClose: function(event) {
				trackSingleEvent(
					ctConstants.rrClose,
					event.eventData.label,
					ctConstants.custom,
					ctConstants.interest, {
						position: event.eventData.position
					}
				);
			},
			rrSubmitReview: function(event) {
				trackSingleEvent(
					ctConstants.ratingreview,
					event.eventData.label,
					ctConstants.advocacy,
					ctConstants.interest, {
						position: event.eventData.position
					}
				);
			},
			rrHelpful: function(event) {
				var eventAction = ctConstants.rrHelpful;
				trackSingleEvent(
					eventAction,
					event.eventData.label,
					ctConstants.advocacy,
					ctConstants.interest, {
						position: event.eventData.position
					}
				);
			},
			rrUnHelpful: function(event) {
				var eventAction = ctConstants.rrNotHelpful;
				trackSingleEvent(
					eventAction,
					event.eventData.label,
					ctConstants.advocacy,
					ctConstants.interest, {
						position: event.eventData.position
					}
				);
			},
			rrReported: function(event) {
				trackSingleEvent(
					ctConstants.rrReported,
					event.eventData.label,
					ctConstants.advocacy,
					ctConstants.interest, {
						position: event.eventData.position
					}
				);
			},
			rrReview: function(event) {
				trackSingleEvent(
					ctConstants.ratingreview,
					event.eventData.label,
					ctConstants.advocacy,
					ctConstants.interest, {
						position: event.eventData.position
					}
				);
			},
			rrIntentReview: function(event) {
				trackSingleEvent(
					ctConstants.reviewIntent,
					event.eventData.label,
					ctConstants.advocacy,
					ctConstants.interest, {
						position: event.eventData.position
					}
				);
			}
		}
	};

	function trackSingleEvent(action, label, category, subcategory, attributes) { //jshint ignore:line
		var componentPosition = attributes.position || "";
		var analyticsProduct = utils.createProduct();
		analyticsProduct.attributes.integration = "Kritique";
		digitalData.product.unshift(analyticsProduct);
		utils.pushComponent("Kritique", componentPosition, category, subcategory);
		utils.addTrackedEvent(action, label, category, subcategory, attributes);
	}

	Cog.registerStatic({
		name: "analytics.kritiqueHandler",
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
