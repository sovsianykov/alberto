/**
 * Back To Top
 */
(function($) {

	"use strict";

	var api = {};
	var ctConstants;
	var analyticsUtils;

	api.onRegister = function(scope) {
		var $button = scope.$scope;
		ctConstants = this.external.eventsDefinition.ctConstants;
		analyticsUtils = this.external.utils;

		$button.on("click", function(e) {
			e.preventDefault();
			var eventLabel = $(this).text();
			analyticsUtils.addTrackedEvent(ctConstants.anchorLinkClicked, eventLabel, ctConstants.engagement, ctConstants.read, {}, ctConstants.trackEvent);
			$("html, body").animate({
				scrollTop: 0
			}, 700);
		});
	};

	Cog.registerComponent({
		name: "backToTop",
		api: api,
		selector: ".reference-icon-link .back-to-top",
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
