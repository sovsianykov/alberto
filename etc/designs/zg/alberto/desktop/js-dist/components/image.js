/**
 * Image
 */
(function() {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;

	function Image($el) {
		this.$el = $el;
		this.altText = this.$el.find("img").attr("alt") || "";
		this.position = analyticsUtils.getComponentPosition(this.$el);

		this.bindUIEvents();
	}

	function isSmartLabel($el) {
		return $el.attr("href").includes("smartlabel");
	}

	Image.prototype.bindUIEvents = function() {
		this.$el.on("click", function() {
			Cog.fireEvent("image", analyticsDef.CLICK.IMAGE_CLICK, {
				altText: this.altText,
				componentPosition: this.position
			});
		}.bind(this));
		var $anchors = this.$el.find("a");
		if ($anchors.length > 0) {
			analyticsUtils.trackLinks($anchors, {
				componentName: "Image",
				componentPosition: this.position,
				href: $anchors.attr("href"),
				type: analyticsUtils.isExternalLink($anchors.attr("href"), isSmartLabel($anchors)) ? analyticsDef.ctConstants.ExternalLink
						: analyticsDef.ctConstants.linkClick,
				label: this.altText || analyticsUtils.determineLinkTitle($anchors)
			});
		}
	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;

		new Image(scope.$scope);
	};

	Cog.registerComponent({
		name: "image",
		api: api,
		selector: ".image",
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
