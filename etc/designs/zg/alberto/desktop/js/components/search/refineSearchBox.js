(function() {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;
	var isVisible = "is-visible";

	function RefineSearchBox($el) {
		this.$el = $el;
		this.componentPosition = analyticsUtils.getComponentPosition($el);
		this.$clearButton = $el.find(".refineSearchClearButton");
		this.$searchButton = $el.find(".refineSearchSubmitButton");
		this.$refineSearchInput = $el.find(".refineSearchInput");
		this.$refineSearchHeader = $el.find(".refineSearchHeader");
		this.setInitialState();
		this.bindUIEvents();
		this.onSiteSearchResult(this.$refineSearchInput.val(), this.componentPosition);
	}

	RefineSearchBox.prototype = {
		setInitialState: function() {
			if (this.$refineSearchInput.val().trim() !== "") {
				// By default, the header will not be visible so set it to visible when the search phrase is not empty
				this.$refineSearchHeader.addClass(isVisible);
			}
			this.updateSearchButtonState();
		},

		bindUIEvents: function() {
			this.$clearButton.on("click", function(event) {
				event.preventDefault();
				this.$refineSearchInput.val("");
				this.$refineSearchHeader.removeClass(isVisible);
				this.updateSearchButtonState();
			}.bind(this));

			this.$refineSearchInput.on("input", function() {
				this.$refineSearchHeader.removeClass(isVisible);
				this.updateSearchButtonState();
			}.bind(this));

			this.$searchButton.on("click", function() {
				this.onSiteSearch(this.$refineSearchInput.val(), this.componentPosition);
			}.bind(this));
		},

		updateSearchButtonState: function() {
			if (this.$refineSearchInput.val().trim() !== "") {
				this.$searchButton.prop("disabled", false);
			} else {
				this.$searchButton.prop("disabled", true);
			}
		},

		onSiteSearch: function(keyword, position) {
			Cog.fireEvent("refineSearchBox", analyticsDef.CLICK.SITE_SEARCH, {
				type: "Refine Search Box",
				action: analyticsDef.ctConstants.siteSearch,
				label: keyword,
				componentPosition: position,
				keyword: keyword
			});
		},

		onSiteSearchResult: function(keyword, position) {
			if (this.$refineSearchInput.val().trim() !== "") {
				var resultsCount = parseInt(this.$refineSearchHeader.data("result-count"), 10);
				Cog.fireEvent("refineSearchBox",
					analyticsDef.CLICK.SITE_SEARCH, {
						type: "Refine Search Box",
						action: analyticsDef.ctConstants.searchResults,
						label: keyword + " - " + resultsCount,
						componentPosition: position,
						keyword: keyword,
						resultNumber: resultsCount
					});
			}
		}
	};

	api.onRegister = function(element) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		new RefineSearchBox(element.$scope);
	};

	Cog.registerComponent({
		name: "refineSearchBox",
		api: api,
		selector: ".refineSearchBox",
		requires: [{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
		{
			name: "analytics.utils",
			apiId: "utils"
		}]
	});
})();
