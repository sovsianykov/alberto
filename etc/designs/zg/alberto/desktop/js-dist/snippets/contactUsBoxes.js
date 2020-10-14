(function($) {
	"use strict";

	var api = {};
	var utils;
	var ctConstants;
	var $placeholder = $("[class*='contact-tile--']");

	function ContactUsBoxes($contactUsBoxes) {
		this.$contactUsBoxes = $contactUsBoxes;
		this.$tilesHolder = this.$contactUsBoxes.find(".tiles-holder");
		this.$tile = this.$tilesHolder.find($placeholder);

		this.$tile.on("click", function() {
			var $link = $(this).find("a").last();
			var linkHref = $link.attr("href");
			var clickedElementAttr = $(event.target).attr("href");
			if (!clickedElementAttr) {
				var label = digitalData.page.pageInfo.pageName + " - " + $link.text() + " - " + linkHref;
				utils.addTrackedEvent(ctConstants.linkClick, label, ctConstants.engagement, ctConstants.read);
			}
			window.location.href = linkHref;
		});
	}

	api.onRegister = function(scope) {
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		new ContactUsBoxes(scope.$scope);
	};

	Cog.registerComponent({
		name: "contact-us-boxes",
		api: api,
		selector: ".composite-contact_us_boxes",
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
