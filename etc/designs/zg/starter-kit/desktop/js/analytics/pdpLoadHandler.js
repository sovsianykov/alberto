(function() {
	"use strict";

	var api = {};
	var event;
	var utils;

	api.init = function() {
		event = this.external.eventsDefinition.LOAD.PRODUCT_INFO;
		utils = this.external.utils;
		if (utils.isAnalyticsConfigured() && digitalData.page.category.pageType === "Product Detail") {
			var productInfo = {
				EAN: getSeoMetaTag("productID"),
				productTitle: getSeoMetaTag("name")
			};
			Cog.fireEvent("productInfo", event, productInfo);
		}
	};

	function getSeoMetaTag(itemprop) {
		var metas = document.getElementsByTagName("body")[0].getElementsByTagName(
				"meta");

		for (var i = 0; i < metas.length; i++) {
			if (metas[i].getAttribute("itemprop") === itemprop) {
				return metas[i].getAttribute("content");
			}
		}
		return "";
	}

	Cog.registerStatic({
		name: "analytics.pdpLoadHandler",
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
