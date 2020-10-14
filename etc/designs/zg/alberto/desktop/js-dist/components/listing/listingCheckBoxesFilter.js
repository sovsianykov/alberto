(function($) {
	"use strict";

	var api = {};
	var cache = {};
	var filtersHandler;
	var analyticsUtils;
	var ctConstants;
	var breakpoints;
	var urlUtils;
	var checkboxFilterIndex = 0;
	var radioFilterIndex = 0;

	function ListingCheckBoxesFilter($el) {
		this.$el = $el;
		this.$componentContent = $el.children(".component-content");
		this.initiallyShownCheckboxesCount = parseInt(this.$componentContent.data("config").initiallyShownCheckboxesCount, 10);

		if (this.$el.find(".listingRadioFilter-items").length > 0) {
			radioFilterIndex++;
			this.$filterGroupId = "radioButtonFilter" + radioFilterIndex;
			this.$checkboxes = this.$el.find(".listingRadioFilter-input");
			this.$filterGroupName = $el.find(".listingRadioFilter-title");
			this.$expandableCheckboxes = $el.find(".listingRadioFilter-item:nth-child(" + this.initiallyShownCheckboxesCount + ")").nextAll();
			this.isRadioButtonFilter = true;

		} else {
			checkboxFilterIndex++;
			this.$filterGroupId = "checkboxFilter" + checkboxFilterIndex;
			this.$checkboxes = this.$el.find(".listingCheckBoxesFilter-input");
			this.$filterGroupName = $el.find(".listingCheckBoxesFilter-title");
			this.$expandableCheckboxes = $el.find(".listingCheckBoxesFilter-item:nth-child(" + this.initiallyShownCheckboxesCount + ")").nextAll();
			this.isRadioButtonFilter = false;
		}

		this.$showMoreButton = $el.find(".js-toggle-filters.more");
		this.$showLessButton = $el.find(".js-toggle-filters.less");

		this.$targetListing = $(".listing");
		this.listingConfig = JSON.parse(this.$targetListing.find("script[type='application/json']").eq(0).text());
		this.basePath = this.listingConfig.path;
		this.componentPosition = analyticsUtils.getComponentPosition(this.$el);
		this.listingPosition = analyticsUtils.getComponentPosition(this.$targetListing);
		this.initializeComponent();
		this.bindUIEvents();
		this.bindEnquire();
	}

	ListingCheckBoxesFilter.prototype = {
		initializeComponent: function() {
			this.$expandableCheckboxes.addClass("is-hidden");
			if (this.$checkboxes.length === 0) {
				this.$componentContent.addClass("is-hidden");
			} else if (this.$checkboxes.length <= this.initiallyShownCheckboxesCount) {
				this.$showLessButton.addClass("is-hidden");
				this.$showMoreButton.addClass("is-hidden");
			}
			this.updateFiltersFromUrl();
		},

		bindUIEvents: function() {
			this.$checkboxes.on("change", function(event) {
				if ((this.$checkboxes.filter(":checked").length > 1) && (this.isRadioButtonFilter)) {
					this.$checkboxes.prop("checked", false);
					event.target.checked = true;
				}
				this.updateFilters(event, this.$filterGroupId, this.isRadioButtonFilter);
			}.bind(this));

			this.$showMoreButton.on("click", function() {
				this.$showMoreButton.addClass("is-hidden");
				this.$showLessButton.removeClass("is-hidden");
				this.$expandableCheckboxes.removeClass("is-hidden");
			}.bind(this));

			this.$showLessButton.on("click", function() {
				this.$showLessButton.addClass("is-hidden");
				this.$showMoreButton.removeClass("is-hidden");
				this.$expandableCheckboxes.addClass("is-hidden");
				this.$el.removeClass("is-active");
			}.bind(this));

			Cog.addListener("checkboxFilters", "updateFilters", function() {
				this.updateFilters(event, this.$filterGroupId, this.isRadioButtonFilter);
			}.bind(this));

			Cog.addListener("checkboxFilters", "clearFilters", function() {
				this.clearFilters();
			}.bind(this));
		},

		bindEnquire: function() {
			var clickHandler = this.mobileFilterToggle.bind(this);

			enquire.register("only screen and (max-width: " + breakpoints.maxMobile + "px)", {
				match: function() {
					this.$filterGroupName.on("click", clickHandler);
				}.bind(this),
				unmatch: function() {
					this.$filterGroupName.unbind("click", clickHandler);
					this.initializeComponent();
					this.$el.removeClass("is-active");
				}.bind(this)
			});
		},

		mobileFilterToggle: function() {
			this.$expandableCheckboxes.removeClass("is-hidden");
			this.$showLessButton.removeClass("is-hidden");
			this.$showMoreButton.addClass("is-hidden");
		},

		getData: function() {
			var path = filtersHandler.getGroupedTemplateUrl().replace("{path}", this.basePath);
			filtersHandler.trackCheckboxFilters({
				componentName: "Listing Checkboxes Filter",
				componentPosition: this.componentPosition
			});

			if (cache[path]) {
				refreshListing(this.$targetListing, cache[path]);
				this.trackProductImpressionChange();
				return;
			}

			this.$el.addClass("loading");

			$.ajax(path, {
					method: "get",
					beforeSend: urlUtils.addWcmModeIfNeeded
				})
				.always(function() {
					this.$el.removeClass("loading");
				}.bind(this))
				.done(function(data) {
					cache[path] = data;
					refreshListing(this.$targetListing, data);
					Cog.fireEvent("listingCheckBoxesFilter", "filterUpdate");
					this.trackProductImpressionChange();
				}.bind(this));
		},

		trackProductImpressionChange: function() {
			Cog.fireEvent("listing", ctConstants.productImpression, {
				componentName: "Listing",
				componentPosition: this.listingPosition,
				products: analyticsUtils.fetchVisibleListingItems(this.$targetListing)
			});
		},

		updateFilters: function(event, groupId, isRadioButtonFilter) {

			var $clickedCheckbox = $(event.target);
			var tagLabel = $clickedCheckbox.val();
			var isChecked = $clickedCheckbox.prop("checked");

			if (isChecked) {
				filtersHandler.addFilterTag(tagLabel, groupId, isRadioButtonFilter);
			} else {
				filtersHandler.removeFilterTag(tagLabel, groupId);
			}
			this.updateUrl();
			this.getData();
		},

		clearFilters: function() {
			this.$checkboxes.filter(":checked").prop("checked", false);
			filtersHandler.clearTags();
			this.updateUrl();
			this.getData();
		},

		updateFiltersFromUrl: function() {
			var url = window.location.href;
			var checkedFiltersStr = urlUtils.getQueryParams(url)[this.$filterGroupId];
			if (checkedFiltersStr) {
				var checkedFilters = checkedFiltersStr.split(",").map(function(tag) {
					return filtersHandler.decodeFilter(tag);
				});
				this.$checkboxes.each(function(index, item) {
					var $item = $(item);
					if (checkedFilters.includes($item.val())) {
						$item.prop("checked", true);
						filtersHandler.addFilterTag($item.val(), this.$filterGroupId);
						$item.parent().removeClass("is-hidden");
					}
				}.bind(this));
			}
		},

		updateUrl: function() {
			var id = this.$filterGroupId;
			var url = window.location.href;
			var params = urlUtils.getQueryParams(url, true);
			delete params[id];
			url = urlUtils.removeParameters(url);
			var selectedGroupTags = filtersHandler.getTagsForGroup(this.$filterGroupId);

			//add all previous params except checkbox-filter-related
			for (var key in params) {
				if (params.hasOwnProperty(key)) {
					url = urlUtils.addOrUpdateQueryParam(url, key, encodeURIComponent(params[key]));
				}
			}

			if (selectedGroupTags && selectedGroupTags.length > 0) {
				url = urlUtils.addOrUpdateQueryParam(url, id, encodeURIComponent(selectedGroupTags));
				window.history.pushState(url, document.title, url);
			} else {
				window.history.pushState(url, document.title, url);
			}
		}
	};

	function refreshListing($listing, content) {
		$listing
			.html(content)
			.removeClass("initialized");
		Cog.init({$element: $listing});
		Cog.fireEvent("listigFilter", "UPDATE_COUNT_ON_CHECKBOXES_CHANGE", {
			data: $listing,
			listingEmptyClassCount: $listing.find(".listing-empty").length 
			// if listing-empty class is available in DOM, 
			// it means no products available and hence the length `$listing.find(".listing-empty").length` will be 1
		});
	}

	api.onRegister = function(scope) {
		filtersHandler = this.external.filters;
		ctConstants = this.external.eventsDefinition.ctConstants;
		analyticsUtils = this.external.utils;
		breakpoints = breakpoints || this.external.breakpoints;
		urlUtils = this.external.urlUtils;
		new ListingCheckBoxesFilter(scope.$scope);
	};

	Cog.registerComponent({
		name: "listingCheckBoxesFilter",
		api: api,
		selector: ".listingCheckBoxesFilter",
		requires: [
			{
				name: "utils.filters",
				apiId: "filters"
			},
			{
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
			},
			{
				name: "utils.url",
				apiId: "urlUtils"
			}
		]
	});
})(Cog.jQuery());
