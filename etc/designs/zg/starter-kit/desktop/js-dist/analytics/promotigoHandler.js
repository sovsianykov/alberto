(function() {
	"use strict";

	var api = {};
	var analyticsUtils;
	var ctConstants;

	function PromotigoHandler() {
		this.bindEvents();
	}

	PromotigoHandler.prototype = {

		bindEvents: function() {
			if (analyticsUtils.isAnalyticsConfigured()) {
				Cog.addListener("promotigo.analytics", "onPromotigoLaunch", this.onPageLoad);
				Cog.addListener("promotigo.analytics", "editQuestionAndAnswerFields", this.onEditFields);
				Cog.addListener("promotigo.analytics", "onPromotigoSubmit", this.onFormSubmmition);
			}
		},

		onPageLoad: function(event) {
			var attributesObject = {};
			analyticsUtils.pushComponent("Promotigo", event.eventData.componentPosition,
				ctConstants.engagement, ctConstants.interest);
			analyticsUtils.addTrackedEvent(ctConstants.survey, "Survey Launch", ctConstants.engagement,
				ctConstants.interest, attributesObject, ctConstants.trackEvent);

		},

		onEditFields: function(event) {
			var attributesObject = {
				surveyQuesAns: event.eventData.questionAndAnswers
			};
			analyticsUtils.pushComponent("Promotigo", event.eventData.componentPosition,
				ctConstants.engagement, ctConstants.interest, attributesObject);
			analyticsUtils.addTrackedEvent(ctConstants.survey, "Survey Edited", ctConstants.engagement,
				ctConstants.interest, attributesObject, ctConstants.trackEvent);
		},

		onFormSubmmition: function(event) {
			var attributesObject = {
				surveyQuesAns: event.eventData.questionAndAnswers
			};
			analyticsUtils.pushComponent("Promotigo", event.eventData.componentPosition,
				ctConstants.engagement, ctConstants.interest, attributesObject);
			analyticsUtils.addTrackedEvent(ctConstants.survey, "Survey Submitted", ctConstants.engagement,
				ctConstants.interest, attributesObject, ctConstants.trackEvent);
		}
	};

	api.init = function() {
		ctConstants = this.external.eventsDefinition.ctConstants;
		analyticsUtils = this.external.utils;

		new PromotigoHandler();
	};

	Cog.registerStatic({
		name: "analytics.promotigo",
		api: api,
		requires: [{
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
