(function($, _) {
	"use strict";

	var api = {};

	function SearchFiltersBox($el) {
		this.$el = $el;

		if (this.countFilters() > 0 && this.countSearchResults() > 0) {
			this.$el.addClass("is-not-empty");
		}
	}

	SearchFiltersBox.prototype = {

		countFilters: function() {
			var $checkboxes = this.$el.find(".checkbox");

			return $checkboxes.length;
		},

		countSearchResults: function() {
			var $counters = $(".datalayer-search-results-count");
			var searchResultsCount = 0;

			if ($counters.length > 0) {
				_.forEach($counters, function(counter) {
					var $counter = $(counter);
					var numberOfResults = window.parseInt($counter.html(), 10);

					searchResultsCount = searchResultsCount + numberOfResults;
				});
			}

			return searchResultsCount;
		}
	};

	api.onRegister = function(scope) {
		new SearchFiltersBox(scope.$scope);
	};

	Cog.registerComponent({
		name: "searchFiltersBox",
		api: api,
		selector: ".search-filters"
	});
})(Cog.jQuery(), _);
