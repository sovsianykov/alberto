/**
 * Breadcrumbs
 */
(function() {
	"use strict";

	var api = {};
	var analyticsUtils;

	function Breadcrumbs($el) {
		this.$links = $el.find("a");
		this.componentPosition = analyticsUtils.getComponentPosition($el);

		analyticsUtils.trackLinks(this.$links, {
			componentName: "Breadcrumbs",
			componentPosition: this.componentPosition
		});
	}

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;

		new Breadcrumbs(scope.$scope);
	};

	Cog.registerComponent({
		name: "breadcrumbs",
		api: api,
		selector: ".breadcrumbs",
		requires: [
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]
	});
})();
