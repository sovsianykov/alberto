(function() {
	"use strict";

	var api = {};
	var utils;
	var ctConstants;
	var isRegistered;

	api.init = function() {
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
			Cog.addListener("countryLanguageSelector", "countrySelector", countryLanguageSelector.events.countryChange);
			Cog.addListener("countryLanguageSelector", "languageSelector", countryLanguageSelector.events.languageChange);
			isRegistered = true;
		}
	}

	var countryLanguageSelector = {
		events: {
			languageChange: function(event) {
				utils.addTrackedEvent(ctConstants.languageSelector, event.eventData.label, ctConstants.custom, ctConstants.read);
			},
			countryChange: function(event) {
				utils.addTrackedEvent(ctConstants.countryselected, event.eventData.label, ctConstants.custom, ctConstants.read);
			}
		}
	};

	Cog.registerStatic({
		name: "analytics.countryLanguageSelectorHandler",
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
