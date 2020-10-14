(function() {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;

	api.onRegister = function(scope) {
		var $articleList = scope.$scope;
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;

		$articleList.on("click", "a", function(e) {
			onClickLinkArticle(e, analyticsUtils.getComponentPosition($articleList));
		});
	};

	function onClickLinkArticle(e, position) {
		Cog.fireEvent("articleList", analyticsDef.CLICK.ARTICLE_LINK, {
			query: e.currentTarget.href,
			componentPosition: position
		});
	}

	Cog.registerComponent({
		name: "articleList",
		api: api,
		selector: ".articleList",
		requires: [{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
			{
				name: "analytics.utils",
				apiId: "utils"
			}]
	});
})();
