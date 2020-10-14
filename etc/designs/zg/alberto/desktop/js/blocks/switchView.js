(function() {
	"use strict";

	var api = {};

	function SwitchesMode($el) {
		this.$el = $el;
		this.$gridViewButton = this.$el.find(".switchToGridButton");
		this.$listViewButton = this.$el.find(".switchToListButton");
		this.$resultsWrapper = this.$el.closest(".product-results-wrapper");

		this.switchToGrid();
		this.switchToList();
		this.setDefaultState();
	}

	SwitchesMode.prototype = {
		switchToList: function() {
			this.$listViewButton.on("click", function() {
				this.$resultsWrapper.addClass("display-list").removeClass("display-grid");
			}.bind(this));
		},
		switchToGrid: function() {
			this.$gridViewButton.on("click", function() {
				this.$resultsWrapper.removeClass("display-list").addClass("display-grid");
			}.bind(this));
		},
		setDefaultState: function() {
			this.$resultsWrapper.removeClass("display-list").addClass("display-grid");
		}
	};

	api.onRegister = function(scope) {
		new SwitchesMode(scope.$scope);
	};

	Cog.registerComponent({
		name: "switchView",
		api: api,
		selector: ".displayModeSwitches"
	});
})(Cog.jQuery());
