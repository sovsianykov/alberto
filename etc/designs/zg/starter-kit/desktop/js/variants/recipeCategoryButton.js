(function($) {
	"use strict";

	var api = {};

	function SubcategorySection($el) {
		this.$el = $el;
		this.$buttons = $el.find(".button-primary, .button-secondary, .button-tertiary, .inline-button");
		this.totalElements = $el.find(".recipeList--as-carousel").data("total-elements");

		this.appendTotal();
	}

	SubcategorySection.prototype.appendTotal = function() {
		if (this.totalElements) {
			$.each(this.$buttons, function(i, btn) {
				var label = $(btn).text() + " (" + this.totalElements + ")";
				$(btn).text(label);
			}.bind(this));
		}
	};

	api.onRegister = function(scope) {
		new SubcategorySection(scope.$scope);
	};

	Cog.registerComponent({
		name: "subcategorySection",
		api: api,
		selector: ".composite-subcategory-section"
	});
})(Cog.jQuery());
