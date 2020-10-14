(function() {
	"use strict";

	var api = {};
	var utils;
	var ctConstants;

	api.init = function() {
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("chatBot", "chatBotAnalytics", chatBotStartButtonClicked);
		}
	}

	function chatBotStartButtonClicked() {
		utils.addTrackedEvent(ctConstants.chat, ctConstants.chatBotOpen,
			ctConstants.engagement, ctConstants.interest, {}, ctConstants.trackEvent);
	}

	Cog.registerStatic({
		name: "analytics.chatBot",
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

}());
