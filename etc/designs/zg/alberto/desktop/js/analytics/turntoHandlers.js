/**
 * turnto (analytics handlers)
 */
(function() {
	"use strict";

	var api = {};
	var utils;
	var events;
	var ctConstants;

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("turnto", events.SUBMIT.TURNTO_QUESTION, questionSubmitted);
			Cog.addListener("turnto", events.SUBMIT.TURNTO_ANSWER, answerSubmitted);
			Cog.addListener("turnto", events.CLICK.TURNTO_INACCURATE, ratedInaccurateClicked);
			Cog.addListener("turnto", events.CLICK.TURNTO_SEE_QUESTION, questionClicked);
			Cog.addListener("turnto", events.CLICK.TURNTO_TEASER_SEE_QUESTION, teaserQuestionsClicked);
		}
	}

	function teaserQuestionsClicked(event) {
		pushTurnToEvent("Location Top Module - See question", event.eventData.position);
	}

	function questionClicked(event) {
		pushTurnToEvent("Location Middle Module - See question", event.eventData.position);
	}

	function questionSubmitted(event) {
		pushTurnToEvent("Question Submit", event.eventData.position);
	}

	function answerSubmitted(event) {
		pushTurnToEvent("Answer Submit", event.eventData.position);
	}

	function ratedInaccurateClicked(event) {
		pushTurnToEvent("Rated inaccurate", event.eventData.position);
	}

	function pushTurnToEvent(eventLabel, componentPosition) {
		utils.pushComponent(
			"TurnTo",
			componentPosition,
			ctConstants.engagement,
			ctConstants.interest
		);
		utils.addTrackedEvent(
			ctConstants.turnto,
			eventLabel,
			ctConstants.engagement,
			ctConstants.interest
		);
	}

	api.init = function() {
		utils = this.external.utils;
		events = this.external.eventsDefinition;
		ctConstants = this.external.eventsDefinition.ctConstants;
		addEventListeners();
	};

	Cog.registerStatic({
		name: "analytics.turntoHandler",
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
