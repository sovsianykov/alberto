(function() {
	"use strict";

	var analyticsUtils;
	var analyticsDef;
	var api = {};

	api.onRegister = function(element) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		trackClicks(element.$scope);
	};

	function trackClicks($scope) {
		var $anchor = $scope.find("a");
		var href = $anchor.attr("href");
		var componentPosition = analyticsUtils.getComponentPosition($scope);

		analyticsUtils.trackLinks($scope, {
			componentName: "External link",
			href: href,
			componentPosition: componentPosition,
			type: analyticsUtils.isExternalLink(href) ? analyticsDef.ctConstants.ExternalLink : analyticsDef.ctConstants.linkClick
		});
	}

	Cog.registerComponent({
		name: "parametrizedhtml",
		api: api,
		selector: ".reference-link,.reference-icon-link",
		requires: [
			{
				name: "analytics.utils",
				apiId: "utils"
			},
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			}
		]
	});
})();
