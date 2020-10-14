(function($) {
	"use strict";
	function SearchFilterMobile($el) {
		this.$el = $el;
		this.$filter = $(".search-filters");
		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);

		this.init();
	}

	SearchFilterMobile.prototype = {
		init: function() {
			var $btnFilter = $(".cta-filter-mobile");
			var $btnClose = $(".title-component-filter");
			var _container = ".searchResults-options-container";

			$(_container).append($btnFilter);
			$btnFilter.appendTo(_container);
			$btnFilter.click(this.openFilter);
			$btnClose.click(this.closeFilter);
		},

		openFilter: function() {
			this.$filter.show();
		},
		closeFilter: function() {
			this.$filter.removeAttr("style");
		}
	};

	var bindAll;
	var api = {
		onRegister: function(scope) {
			bindAll = bindAll || this.external.bindAll;
			new SearchFilterMobile(scope.$scope);
		}
	};
	Cog.registerComponent({
		name: "search.filterMobile",
		api: api,
		selector: ".search-filters",
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});
})(Cog.jQuery());
