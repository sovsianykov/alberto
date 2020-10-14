(function($) {

	"use strict";
	
	var countries = [],
		domElements = [],
		api = {};

	var substringMatcher = function(strs) {
		return function findMatches(q, cb) {
			var matches = [],
				substrRegex = new RegExp(q, "i");

			$.each(strs, function(i, str) {
				if (substrRegex.test(str)) {
					matches.push(str);
				}
			});

			cb(matches);
		};
	};

	api.init = function() {
		var $countryName = $(".accordion--country-selector a.navigation-item-title");

		$countryName.each(function() {
			domElements.push($(this));
			countries.push($(this).attr("title"));
		});
	};

	api.onRegister = function(scope) {
		var $element = scope.$scope;
		var $searchInput = $element.find(".search-query");
		var $searchForm = $element.find(".form-search");

		$searchInput.typeahead({
				hint: true,
				highlight: true,
				minLength: 3
			},
			{
				name: "countries",
				source: substringMatcher(countries)
			});

		$searchInput.on("typeahead:select", function(e) {
			var $inputHint = $(e.currentTarget);
			var $chosenCountry = $inputHint.val().toLowerCase();
			domElements.forEach(function(el) {
				if (el.attr("title").toLowerCase() === $chosenCountry) {
					window.location.href = el.attr("href");
				}
			});
		});

		$searchForm.on("submit", function() {
			var query = $searchInput.val().toLowerCase();

			domElements.forEach(function(el) {
				if (el.attr("title").toLowerCase() === query) {
					var url = el.attr("href");
					$searchForm.attr("action", url);
				}
			});
		});
	};

	Cog.registerComponent({
		name: "searchBox-autocomplete",
		api: api,
		selector: ".searchBox--autocomplete"
	});

})(Cog.jQuery());