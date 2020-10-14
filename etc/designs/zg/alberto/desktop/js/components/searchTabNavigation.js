/**
 * Search tab navigation component
 */

(function() {
	"use strict";

	var api = {};
	var analyticsUtils;

	function SearchTabNav($el) {
		this.$links = $el.find("a");
		this.componentPosition = analyticsUtils.getComponentPosition($el);

		analyticsUtils.trackLinks(this.$links, {
			componentName: "Search Tab Navigation",
			componentPosition: this.componentPosition
		});
	}

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;

		new SearchTabNav(scope.$scope);
	};

	Cog.registerComponent({
		name: "searchTabNavigation",
		api: api,
		selector: ".searchTabNavigation",
		requires: [{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}]
	});
})(Cog.jQuery());
