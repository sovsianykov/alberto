/**
 * Accordion
 */
(function($) {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;

	api.onHeaderClick = function(e, position) {
		var $this = $(e.currentTarget),
			$headParent = $this.parent();

		$headParent.toggleClass("is-active");
		onClickTab($this, position);
	};

	api.onRegister = function(element) {
		var $accordion = element.$scope;

		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;

		$accordion.on("click", "> div > ul > li.accordion-slide > div.accordion-head", function(e) {
			api.onHeaderClick(e, analyticsUtils.getComponentPosition($accordion));
		});
		$accordion.on("click", "> div > ul > li.accordion-slide > div.accordion-head > h3.accordion-title > a", function(e) {
			e.preventDefault();
		});
	};

	function onClickTab($accordionHead, position) {
		Cog.fireEvent("accordion", analyticsDef.CLICK.ACCORDION_CLICK, {
			query: $accordionHead.find(".accordion-title > [title]")[0].title,
			componentPosition: position
		});
	}

	Cog.registerComponent({
		name: "accordion",
		api: api,
		selector: ".accordion",
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
