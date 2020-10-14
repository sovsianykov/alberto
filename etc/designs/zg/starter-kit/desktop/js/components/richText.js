/**
 * Rich Text
 */
(function($) {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;

	function RichText($el) {
		this.$el = $el;
		if (this.$el.hasClass("form-legal-info")) {
			var paraElememt = this.$el.find("p");
			var newParaElement = document.createElement("p");
			newParaElement.innerHTML = paraElememt.html();
			paraElememt.html(newParaElement.textContent);
		}
		this.$image = this.$el.find("img");
		this.$links = this.$el.find("a");
		this.position = analyticsUtils.getComponentPosition(this.$el);

		this.bindUIEvents();
	}

	RichText.prototype.bindUIEvents = function() {

		this.$image.on("click", function(event) {
			var altText = $(event.target).attr("alt");
			Cog.fireEvent("image", analyticsDef.CLICK.IMAGE_CLICK, {
				altText: altText,
				componentPosition: this.position
			});
		}.bind(this));

		analyticsUtils.trackLinks(this.$links, {
			componentName: "Rich Text",
			componentPosition: this.position
		});
	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;

		new RichText(scope.$scope);
	};

	Cog.registerComponent({
		name: "richText",
		api: api,
		selector: ".richText",
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
