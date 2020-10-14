(function($) {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;
	var breakpoints;
	var classes = {
		isEmpty: "is-empty",
		isHidden: "is-hidden",
		filterIsSelected: "filter-is-selected",
		isDisabled: "is-disabled"
	};

	function SearchFilter($el) {
		this.$el = $el;
		this.componentPosition = analyticsUtils.getComponentPosition($el);
		this.$componentContent = $el.children(".component-content");
		this.$showMoreButton = $el.find(".js-toggle-filters.more");
		this.$showLessButton = $el.find(".js-toggle-filters.less");
		this.$checkboxWrappers = $el.find(".checkbox");
		this.$checkboxes = $el.find(".filter-checkbox");
		this.visibleOptionsNumber = parseInt(this.$componentContent.data("config").visibleOptions, 10);
		this.$expandableOptions = $el.find(".checkbox:nth-child(" + this.visibleOptionsNumber + ")").nextAll();
		this.bindUIEvents();
		this.bindEnquire();
		this.updateSelectedFiltersStatus();
		this.updateFiltersGroupsStatus();
		this.analyticEvents();
	}

	SearchFilter.prototype = {
		bindUIEvents: function() {
			this.$showMoreButton.on("click", function() {
				this.$showMoreButton.addClass(classes.isHidden);
				this.$showLessButton.removeClass(classes.isHidden);
				this.$expandableOptions.removeClass(classes.isHidden);
			}.bind(this));

			this.$showLessButton.on("click", function() {
				this.$showLessButton.addClass(classes.isHidden);
				this.$showMoreButton.removeClass(classes.isHidden);
				this.$expandableOptions.addClass(classes.isHidden);
				this.$el.removeClass("is-active");
			}.bind(this));

			this.$checkboxWrappers.on("click", ".filter-checkbox, .filter-category-link", function(event) {
				var $target = $(event.target);
				var $delegateTarget = $(event.delegateTarget);

				if ($target.hasClass("filter-checkbox")) {
					$delegateTarget.find(".filter-category-link").get(0).click();
				}

				if ($target.hasClass("filter-category-link")) {
					this.$componentContent.addClass(classes.isDisabled);
				}
			}.bind(this));
		},

		bindEnquire: function() {
			var clickHandler = this.mobileFilterToggle.bind(this);

			enquire.register("only screen and (max-width: " + breakpoints.maxMobile + "px)", {
				match: function() {
					this.$el.on("click", clickHandler);
				}.bind(this),
				unmatch: function() {
					this.$el.unbind("click", clickHandler);
					this.$expandableOptions.addClass("is-hidden");
					this.$showLessButton.addClass("is-hidden");
					this.$showMoreButton.removeClass("is-hidden");
					this.$el.removeClass("is-active");
				}.bind(this)
			});
		},

		mobileFilterToggle: function() {
			this.$expandableOptions.removeClass("is-hidden");
			this.$showLessButton.removeClass("is-hidden");
			this.$showMoreButton.addClass("is-hidden");
		},

		analyticEvents: function() {
			var checkedOptions = [];
			$.each(this.$checkboxes, function(index, element) {
				if (element.getAttribute("checked") !== null) {
					var filterValue = element.parentNode.innerText.trim();
					checkedOptions.push(filterValue.slice(0, filterValue.lastIndexOf(" ")));
				}
			});
			if (checkedOptions.length !== 0) {
				this.onFilterClick(checkedOptions.join("|"), this.componentPosition);
			}
		},

		updateSelectedFiltersStatus: function() {
			if (!this.$checkboxes.length) {
				this.$el.addClass(classes.isEmpty);
			} else if (this.$checkboxes.filter(":checked").length) {
				this.$componentContent.addClass(classes.filterIsSelected);
				this.$expandableOptions.removeClass(classes.isHidden);
				this.$showMoreButton.addClass(classes.isHidden);
				this.$showLessButton.removeClass(classes.isHidden);
			} else {
				this.$componentContent.removeClass(classes.filterIsSelected);
			}
		},

		updateFiltersGroupsStatus: function() {
			if (this.$checkboxes.length <= this.visibleOptionsNumber) {
				this.$showMoreButton.addClass(classes.isHidden);
				this.$showLessButton.addClass(classes.isHidden);
			}
		},

		onFilterClick: function(filterOption, position) {
			Cog.fireEvent("searchFilter", analyticsDef.CLICK.SEARCH_FILTER, {
				filterOption: filterOption,
				componentPosition: position
			});
		}
	};

	api.onRegister = function(element) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		breakpoints = breakpoints || this.external.breakpoints;
		new SearchFilter(element.$scope);
	};

	Cog.registerComponent({
		name: "searchFilter",
		api: api,
		selector: ".searchFilter",
		requires: [{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
			{
				name: "analytics.utils",
				apiId: "utils"
			},
			{
				name: "utils.breakpoints",
				apiId: "breakpoints"
			}]
	});
})(Cog.jQuery());
