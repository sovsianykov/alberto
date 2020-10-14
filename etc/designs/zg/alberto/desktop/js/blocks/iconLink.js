/**
 * Analytics for Social platform icons in footer section
 */
(function() {

	"use strict";

	var api = {};
	var utils;
	var ctConstants;

	api.onRegister = function(scope) {
		this.$el = scope.$scope;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		this.$el.on("click", function(e) {
			var eventLabel = e.target.href;
			utils.addTrackedEvent(ctConstants.clickstosocialplatforms,
				eventLabel,
				ctConstants.advocacy,
				ctConstants.lead);
		}.bind(this));
	};

	Cog.registerComponent({
		name: "iconLink",
		api: api,
		selector: "#footer .footer-social-links .reference-icon-link a",
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

}(Cog.jQuery()));
