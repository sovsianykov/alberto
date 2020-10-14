(function() {
	"use strict";

	var api = {};
	var utils, ctConstants;
	var ARTICLE_DETAIL_PAGE = "Article Detail";

	api.init = function() {
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		if (utils.isAnalyticsConfigured() && digitalData.page.category.pageType === ARTICLE_DETAIL_PAGE) {
			var attributesObject = {};
			utils.addTrackedEvent(ctConstants.articleView, digitalData.page.attributes.articleName, ctConstants.Engagement,
				ctConstants.read, attributesObject, ctConstants.trackEvent);
		}
	};
    
	Cog.registerStatic({
		name: "analytics.articleHandler",
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
