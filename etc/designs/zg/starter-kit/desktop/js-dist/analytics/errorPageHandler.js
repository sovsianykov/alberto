(function($) {
	"use strict";

	var api = {};
	var utils, ctConstants;
	var ERROR = "Error";
	var SELECTOR = ".analytics-datalayer.json";

	api.init = function() {
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		if (utils.isAnalyticsConfigured() && typeof digitalData !== "undefined" && typeof digitalData.page !== "undefined" && typeof digitalData.page.category !== "undefined" && typeof digitalData.page.category.pageType !== "undefined" && digitalData.page.category.pageType === ERROR) {
			var referrerName = getReferrerName();
			utils.addTrackedEvent(ctConstants.errorPage, referrerName, ctConstants.custom, ctConstants.other);
		}
	};

	var getReferrerName = function() {
		var referrerName;
		if (document.referrer === "" && typeof digitalData.page.pageInfo !== "undefined" && typeof digitalData.page.pageInfo.pageName !== "undefined") {
			referrerName = digitalData.page.pageInfo.pageName;
		} else {
			var url = document.referrer.substr(window.location.origin.length, document.referrer.length);
			if (url.indexOf(".") > 0) {
				url = url.substr(0,url.indexOf("."));
			}
			$.ajax({
				async: false,
				url: url + SELECTOR,
				type: "GET",
				success: function(result) {
					referrerName = result.pageName;
				},
				error: function() {
					referrerName = ERROR;
				}
			});
		}
		return referrerName;
	};

	Cog.registerStatic({
		name: "analytics.errorPageHandler",
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
}(Cog.jQuery()));
