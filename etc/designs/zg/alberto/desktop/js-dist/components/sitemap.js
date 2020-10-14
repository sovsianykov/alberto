/**
 * Site Map
 */
(function() {
	"use strict";

	var api = {};
	var analyticsUtils;

	function Sitemap($el) {
		this.$links = $el.find("a");
		this.componentPosition = analyticsUtils.getComponentPosition($el);

		analyticsUtils.trackLinks(this.$links, {
			componentName: "Sitemap",
			componentPosition: this.componentPosition
		});
	}

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;
		new Sitemap(scope.$scope);
	};

	Cog.registerComponent({
		name: "sitemap",
		api: api,
		selector: ".sitemap",
		requires: [
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]
	});
})();
