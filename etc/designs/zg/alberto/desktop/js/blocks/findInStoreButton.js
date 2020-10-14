(function() {
	"use strict";

	var api = {};
	var url;
	var analyticsUtils;
	var eventsDefinition;
	var componentPosition;

	function FindInStoreButton($el) {
		this.$el = $el;
		this.$button = $el.find("a");
		this.basePath = url.removeParameters(this.$button.attr("href"));

		this.init();
	}

	FindInStoreButton.prototype.init = function() {
		if (this.$el.parents(".quickview-container").length) {
			Cog.addListener("variantList", "variantChanged", function(e) {
				var ean = e.eventData.ean;
				var path = url.addOrUpdateQueryParam(this.basePath, "ean", ean);
				this.$button.attr("href", path);
			}.bind(this));
		}
		this.$button.on("click", function(event) {
			Cog.fireEvent("storeLocator", eventsDefinition.CLICK.STORE_LOCATOR_CTA, {
				label: event.target.text,
				position: componentPosition
			});
		});
	};

	api.onRegister = function(scope) {
		url = this.external.url;
		new FindInStoreButton(scope.$scope);
		analyticsUtils = this.external.analyticsUtils;
		eventsDefinition = this.external.eventsDefinition;
		componentPosition = analyticsUtils.getComponentPosition(scope.$scope);
	};

	Cog.registerComponent({
		name: "findInStoreButton",
		api: api,
		selector: ".reference-find-in-store-button",
		requires: [
			{
				name: "utils.url",
				apiId: "url"
			},
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "analyticsUtils"
			}
		]
	});
})();
