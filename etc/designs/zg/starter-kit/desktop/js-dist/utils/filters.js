(function($) {
	"use strict";

	var sharedApi = {};
	var filterTags = [];
	var groupedFilterTags = {};
	var sortingOrders = [];
	var selectedSortingOrder = "";
	var urlTemplate = "{path}.filtertags.{tags}.sortingOrder.{order}.html";
	var groupedUrlTemplate = "{path}.sortingOrder.{order}.html?source=checkboxes{checkboxesTags}";
	var urlTemplateWithoutFilters = "{path}.sortingOrder.{order}.html";
	var SELECTORS = {
		filterDropDownOptions: "select[name=filter-order] > option"
	};

	function getSortingOrder() {
		sortingOrders = [];
		$(SELECTORS.filterDropDownOptions).each(function() {
			sortingOrders.push(this.value);
		});
	}
	sharedApi.getTemplateUrl = function() {
		getSortingOrder();
		if (selectedSortingOrder === "") {
			selectedSortingOrder = sortingOrders[0];
		}
		if (filterTags.length) {
			return urlTemplate
				.replace("{tags}", encodeURIComponent(filterTags.join(".")))
				.replace("{order}", selectedSortingOrder);
		}
		return urlTemplateWithoutFilters.replace("{order}", selectedSortingOrder);
	};

	sharedApi.getGroupedTemplateUrl = function() {
		getSortingOrder();
		if (selectedSortingOrder === "") {
			selectedSortingOrder = sortingOrders[0];
		}
		var groupedTags = "";
		if (groupedFilterTags) {
			groupedTags = buildGroupedTagsQuery();
			return groupedUrlTemplate
				.replace("{checkboxesTags}", groupedTags)
				.replace("{order}", selectedSortingOrder);
		}
		return urlTemplateWithoutFilters.replace("{order}", selectedSortingOrder);
	};

	function buildGroupedTagsQuery() {
		var result = "";
		Object.keys(groupedFilterTags).forEach(function(group) {
			result += "&ct-".concat(group).concat("=");
			result += encodeURIComponent(groupedFilterTags[group].join(","));
		});
		return result;
	}

	sharedApi.setFilterTags = function(tags) {
		filterTags = tags.map(function(tag) {
			return tag.replace(/\//g, ":");
		});
	};

	sharedApi.getTagsForGroup = function(groupId) {
		return groupedFilterTags[groupId];
	};

	sharedApi.setSortingOrder = function(sortingOrder) {
		getSortingOrder();
		if (sortingOrders.includes(sortingOrder)) {
			selectedSortingOrder = sortingOrder;
		}
	};

	sharedApi.addFilterTag = function(tag, groupId, isRadioButtonFilter) {
		var tagToAdd = tag.replace(/\//g, ":");

		if (!!groupId) {
			//Add group filter tags
			if (!groupedFilterTags.hasOwnProperty(groupId)) {
				groupedFilterTags[groupId] = [];
			}
			if (isRadioButtonFilter) {
				groupedFilterTags[groupId][0] = tagToAdd;
			} else {
				groupedFilterTags[groupId].push(tagToAdd);
			}
			sharedApi.globalGroupTags.push(tagToAdd);
		} else {
			//Add listing filter tags
			if (!filterTags.includes(tagToAdd)) {
				filterTags.push(tagToAdd);
			}
		}
	};

	sharedApi.removeFilterTag = function(tag, groupId) {
		var tagToRemove = tag.replace(/\//g, ":");

		if (!!groupId && groupedFilterTags.hasOwnProperty(groupId)) {
			//Remove grouped filter tags
			groupedFilterTags[groupId] = groupedFilterTags[groupId].filter(function(t) {
				return t !== tagToRemove;
			});
			if (groupedFilterTags[groupId].length === 0) {
				delete groupedFilterTags[groupId];
			}
			sharedApi.globalGroupTags = sharedApi.globalGroupTags.filter(function(item) {
				return item !== tagToRemove;
			});
		} else {
			//Remove listing filter tags
			filterTags = filterTags.filter(function(t) {
				return t !== tagToRemove;
			});
		}

	};

	sharedApi.clearTags = function() {
		groupedFilterTags = {};
		filterTags = [];
	};

	//decode tag format a:b:c:d:e to a:b/c/d/e
	sharedApi.decodeFilter = function(filter) {
		return filter.replace(/:/g, "/").replace(/\//, ":");
	};

	sharedApi.trackListingFilters = function(data) {
		getSortingOrder();
		sharedApi.globalGroupTags = [];
		var summaryTags = filterTags.filter(function(tag) {
			return tag !== "";
		}).map(function(tag) {
			return tag.substring(tag.lastIndexOf(":") + 1); //only tags titles have to be send as event labels
		});

		summaryTags.push(selectedSortingOrder);
		summaryTags = summaryTags.join(" | ");

		Cog.fireEvent("filters", "analytics", {
			componentName: data.componentName,
			componentPosition: data.componentPosition,
			filters: summaryTags
		});
	};

	sharedApi.trackCheckboxFilters = function(data) {
		var summaryTags = sharedApi.globalGroupTags.map(function(tag) {
			return tag.substring(tag.lastIndexOf(":") + 1); //only tags titles have to be send as event labels
		}).join(" | ");

		Cog.fireEvent("filters", "analytics", {
			componentName: data.componentName,
			componentPosition: data.componentPosition,
			filters: summaryTags
		});
	};

	sharedApi.globalGroupTags = [];

	Cog.registerStatic({
		name: "utils.filters",
		sharedApi: sharedApi,
		api: {}
	});
})(Cog.jQuery());