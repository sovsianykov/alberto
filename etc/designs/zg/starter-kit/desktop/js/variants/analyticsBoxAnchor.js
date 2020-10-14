/**
 * AnalyticsBoxAnchor
 */
(function($) {
	"use strict";

	var api = {};
	var ctConstants;
	var analyticsUtils;
	var SELECTORS = {
		anchorText: ".box-more-title",
		anchorTagExcludeRichTextAnchors: "a:not(.richText a)"
	};

	var ATTRIBUTES = {
		target: "target",
		href: "href",
		blank: "_blank"
	};

	function AnalyticsBoxAnchor($el) {
		this.$el = $el;
		this.$links = this.$el.find(SELECTORS.anchorTagExcludeRichTextAnchors);

		this.bindUIEvents();
	}

	AnalyticsBoxAnchor.prototype.bindUIEvents = function() {

		this.$links.on("click", function() {
			var $target = $(this);
			var hasTargetAttr = $target.attr(ATTRIBUTES.target);
			var targetLink = $target.attr(ATTRIBUTES.href);
			var targetText = $target.find(SELECTORS.anchorText).text();
			var eventLabel = digitalData.page.pageInfo.pageName + " - " + targetText + " - " + targetLink;
			if (hasTargetAttr && hasTargetAttr === ATTRIBUTES.blank) {
				analyticsUtils.addTrackedEvent(ctConstants.ExternalLink, eventLabel, ctConstants.custom, ctConstants.read, {}, ctConstants.trackEvent);
			} else {
				analyticsUtils.addTrackedEvent(ctConstants.linkClick, eventLabel, ctConstants.engagement, ctConstants.read, {}, ctConstants.trackEvent);
			}
		});

	};

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;

		new AnalyticsBoxAnchor(scope.$scope);
	};

	Cog.registerComponent({
		name: "analyticsBoxAnchor",
		api: api,
		selector: ".analytics-box-anchor",
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
})(Cog.jQuery());
