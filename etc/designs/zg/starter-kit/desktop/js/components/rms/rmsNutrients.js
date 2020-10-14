/**
 * RMS Nutrients
 */
(function() {
	"use strict";

	var classes = {
		isHidden: "is-hidden"
	};

	function RmsNutrients($el) {
		this.$el = $el;
		this.$nutrientsItems = this.$el.find(".recipeNutrients-list .recipeNutrients-item");
		this.$button = this.$el.find(".show-all");

		this.showOnlyCore();
		this.addHandlers();
	}

	RmsNutrients.prototype = {
		showOnlyCore: function() {
			this.$nutrientsItems.filter('[data-is-core="false"]').addClass(classes.isHidden);
		},

		showAll: function() {
			this.$nutrientsItems.removeClass(classes.isHidden);
			this.$button.addClass(classes.isHidden);
		},

		addHandlers: function() {
			this.$button.on("click", function() {
				this.showAll();
			}.bind(this));
		}
	};

	var api = {
		onRegister: function(scope) {
			new RmsNutrients(scope.$scope);
		}
	};

	Cog.registerComponent({
		name: "recipeNutrients",
		api: api,
		selector: ".recipeNutrients"
	});
}());
