/**
 * Smartlabel component
 */

(function() {
	"use strict";

	var api = {};
	var analyticsDef;

	function Smartlabel($el) {
		this.$el = $el;
		this.analyticsSetup();
	}

	Smartlabel.prototype = {
		analyticsSetup: function() {
			this.$el.on("click", function() {
				Cog.fireEvent("smartlabel", analyticsDef.CLICK.SMARTLABEL_CLICK, {
					pageType: digitalData.page.category.pageType
				});
			});
		}
	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;

		new Smartlabel(scope.$scope);
	};

	Cog.registerComponent({
		name: "smartlabel",
		api: api,
		selector: ".smartlabel",
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
})();
