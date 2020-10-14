/**
 * Custom select
 */
(function($, _) {
	"use strict";

	var api = {};

	function CustomSelect($el) {
		this.$el = $el;
		this.bindDOM();
		this.getOptionsObject();
		this.replaceSelect();
		this.bindEvents();
	}

	CustomSelect.prototype = {
		bindDOM: function() {
			this.$options = this.$el.find("option");
			this.$wrapper = $("<span class='select-replacement'></span>");
			this.$trigger = $("<a href='#' class='select-trigger' tabindex='-1'></a>");
		},

		replaceSelect: function() {
			this.$el.wrap(this.$wrapper);
			this.setText();
			this.$el.after(this.$trigger);
		},

		getOptionsObject: function() {
			this.options = {};
			_.forEach(this.$options, function(option) {
				var $option = $(option);
				if ($option.attr("value")) {
					this.options[$option.attr("value")] = $option.text();
				}
			}.bind(this));
		},

		setText: function() {
			var value = this.$el.val();
			var text = this.options[value] || this.$options.eq(0).text();
			this.$trigger.text(text);
		},

		bindEvents: function() {
			this.$trigger.on("click focus", function(e) {
				e.preventDefault();
				return false;
			}.bind(this));

			this.$el.on("change", this.setText.bind(this));
		}
	};

	api.onRegister = function(scope) {
		new CustomSelect(scope.$scope);
	};

	Cog.registerComponent({
		name: "customCustomSelect",
		api: api,
		selector: ".listingFilters-articles .filter-category select, .listingFilters-articles .filter-subcategory select"
	});
})(Cog.jQuery(), _);
