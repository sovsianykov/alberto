/**
 * Search Box
 */
(function($) {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;
	var keys = {
		TAB: 9,
		ARROW_UP: 38,
		ARROW_DOWN: 40,
		ENTER: 13
	};
	var constants = {
		UPDATE_SUGGESTIONS_TIMEOUT: 250
	};
	var selectors = {
		searchInput: ".search-query",
		suggestion: ".searchBox-suggestion",
		suggestions: ".searchBox-suggestions",
		advancedSuggestions: ".searchBox-advanced-suggestions",
		advancedSuggestionsLinks: ".searchBox-advanced-suggestions a",
		suggestionItems: ".suggestions-item",
		viewAll: "a.view-all"

	};
	var minAutoSuggestionLength = 3;

	function SearchBoxWithSuggestions($element, focusTrap) {
		this.$elem = $element;
		this.focusTrap = focusTrap.focusTrap;
		this.$button = this.$elem.find(".button");
		this.$input = this.$elem.find(selectors.searchInput);
		this.$suggestionItems = this.$elem.find(selectors.suggestionItems);
		this.$viewAll = this.$elem.find(selectors.viewAll);
		this.componentPosition = analyticsUtils.getComponentPosition($element);
		this.endpoint = "/sk-eu/services/search/suggestions?q={q}&solrCoreName=" + this.$elem.find("input[name='solrCoreName']").val();
		this.advancedSuggestionsUrl = this.$elem.find(selectors.advancedSuggestions).data("path") + ".advanced.results.html?q={query}";

		this.previousQuery = "";
		this.manualSuggestions = this.$elem
			.find(".searchBox-manual-suggestion")
			.toArray()
			.map(function(input) {
				return input.value;
			});
		this.suggestionsContainerTemplate = doT.template(
			this.$elem.find(".suggestions-container-template").text()
		);
		this.updateQuerySuggestions(this.manualSuggestions, "");
		this.bindUIEvents();
		if ($(this.$elem).find("input.search-query").val().trim() !== "") {
			$(this.$elem).find("input.search-query").trigger("keyup");
		}
	}

	SearchBoxWithSuggestions.prototype = {
		bindUIEvents: function() {
			this.$button.on("click", this.onButtonClick.bind(this));
			this.$elem.on("click", selectors.suggestion, this.onSuggestionClick.bind(this));
			this.$input.on("keyup", $.debounce(constants.UPDATE_SUGGESTIONS_TIMEOUT, this.onKeyUp.bind(this)));
			this.$elem.on("keydown", this.onKeyDown.bind(this));
			this.attachTrackingToSuggestions();
		},

		onButtonClick: function(event) {
			if (this.$input.val().trim() === "") {
				event.preventDefault();
			}
			this.onSiteSearch(this.$input.val(), this.componentPosition);
		},

		onSuggestionItemClick: function() {
			var query = this.$input.val().trim();
			this.onSiteSearch(query, this.componentPosition);
		},

		onSuggestionClick: function(event) {
			var searchPhrase = $(event.target).closest(selectors.suggestion).text();
			this.$input.val(searchPhrase);
			this.$button.trigger("click");
		},

		onKeyUp: function(event) {
			var query = this.$input.val().trim();

			if (query === this.previousQuery || event.which === keys.ENTER) {
				return;
			} else if (query.length < minAutoSuggestionLength) {
				this.updateQuerySuggestions(this.manualSuggestions, query);
				this.updateAdvancedSuggestions("");
				this.previousQuery = query;
			} else {
				this.fetchAndUpdateSuggestions(query);
			}
		},

		onKeyDown: function(event) {
			var $target = $(event.target);
			if (isQueryInputOrSuggestion($target) && event.which === keys.ARROW_UP) {
				this.handleArrowUp($target);
			} else if (event.which === keys.ARROW_DOWN) {
				this.handleArrowDown($target);
			}
		},

		handleArrowUp: function($target) {
			if ($target.is(selectors.searchInput)) {
				this.$suggestions.find(selectors.suggestion + ":last").focus();
			} else if (isFirstSuggestion($target)) {
				this.$input.focus();
			} else if ($target.is(selectors.suggestion)) {
				$target.parent().prev().children().focus();
			}
		},

		handleArrowDown: function($target) {
			if ($target.is(selectors.searchInput)) {
				this.$suggestions.find(selectors.suggestion + ":first").focus();
			} else if (isLastSuggestion($target)) {
				this.$input.focus();
			} else if ($target.is(selectors.suggestion)) {
				$target.parent().next().children().focus();
			}
		},

		createSuggestionsContainer: function(suggestions, query) {
			function makeSelectedTextBold(text, queryIdx, length) {
				return text.slice(0, queryIdx) + "<b>" + text.slice(queryIdx, queryIdx + length) + "</b>" +
					text.slice(queryIdx + length);
			}

			var queryLowerCase = query.toLowerCase();

			return this.suggestionsContainerTemplate({
				suggestions: suggestions.map(function(s) {
					var queryIdx = s.toLowerCase().indexOf(queryLowerCase);

					return {
						value: queryIdx > -1 ? makeSelectedTextBold(s, queryIdx, query.length) : s
					};
				})
			});
		},

		updateQuerySuggestions: function(suggestions, query) {
			this.$elem.find(selectors.suggestions).replaceWith(
				this.createSuggestionsContainer(suggestions, query)
			);
			this.$suggestions = this.$elem.find(selectors.suggestions);
		},

		updateAdvancedSuggestions: function(markup) {
			this.$elem.find(selectors.advancedSuggestions).html(markup);
			this.onSiteSearchResult(this.previousQuery, this.componentPosition);
			this.attachTrackingToSuggestions();
			var overlayContainer = $(".overlay-container");
			this.focusTrap(overlayContainer, overlayContainer.find(".search-query"));
		},

		attachTrackingToSuggestions: function() {
			this.$suggestionItems = this.$elem.find(selectors.suggestionItems);
			this.$viewAll = this.$elem.find(selectors.viewAll);
			this.$suggestionItems.on("click", this.onSuggestionItemClick.bind(this));
			this.$viewAll.on("click", this.onSuggestionItemClick.bind(this));
		},

		fetchAndUpdateSuggestions: function(query) {
			$.get(this.endpoint.replace("{q}", query), function(data) {
				if (data && data.suggestions) {
					this.updateQuerySuggestions(data.suggestions, query);
				}
			}.bind(this));

			var searchRequest = this.advancedSuggestionsUrl.replace("{query}", query);
			$.get(searchRequest, this.updateAdvancedSuggestions.bind(this));
		},

		onSiteSearch: function(keyword, position) {
			Cog.fireEvent("searchBoxWithSuggestions", analyticsDef.CLICK.SITE_SEARCH, {
				type: "Search Box With Suggestions",
				action: analyticsDef.ctConstants.siteSearch,
				label: keyword,
				componentPosition: position,
				keyword: keyword
			});
		},

		onSiteSearchResult: function(keyword, position) {
			if (keyword.length >= minAutoSuggestionLength) {
				var resultNumber = 0;
				$(".results-count[value]").each(function(index, element) {
					resultNumber += parseInt(element.getAttribute("value"), 10);
				});
				Cog.fireEvent("searchBoxWithSuggestions",
						analyticsDef.CLICK.SITE_SEARCH, {
							type: "Search Box With Suggestions",
							action: analyticsDef.ctConstants.searchResults,
							label: resultNumber + " - " + keyword,
							componentPosition: position,
							keyword: keyword,
							resultNumber: resultNumber
						});
			}
		}
	};

	function isQueryInputOrSuggestion($elem) {
		return $elem.is(selectors.searchInput + ", " + selectors.suggestion + ", " + selectors.advancedSuggestionsLinks);
	}

	function isFirstSuggestion($elem) {
		return $elem.is(selectors.suggestion) && $elem.parent().prev().length === 0;
	}

	function isLastSuggestion($elem) {
		return $elem.is(selectors.suggestion) && $elem.parent().next().length === 0;
	}

	api.onRegister = function(element) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		new SearchBoxWithSuggestions(element.$scope,this.external.focusTrap);
	};

	Cog.registerComponent({
		name: "searchBoxWithSuggestions",
		api: api,
		selector: ".searchBoxWithSuggestions",
		requires: [{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
		{
			name: "analytics.utils",
			apiId: "utils"
		}, {
			name: "utils.focusTrap",
			apiId: "focusTrap"
		}]
	});

})(Cog.jQuery());
