/**
 * Dynamic listing data switching from external source
 */
(function($) {
	"use strict";

	var api = {};
	var targetHandler;
	var configSelectors;
	var attributes;
	var runmodeUtil;

	var SELECTORS = {
		LISTING_ITEM: ".listing-item"
	};

	var ATTRIBUTES = {
		ITEM_ATTR: "data-item-primarykey",
		QUICKVIEW_ATTR: "data-quickviewean",
		QUICKVIEW_SNIPPET_ATTR: "data-quickviewsnippetpath",
		FAVOURITES_OPTS_ATTR: "data-options"
	};

	function DynamicListing($el) {
		this.$el = $el;
		this.init();
	}

	DynamicListing.prototype = {
		init: function() {
			this.refreshItems();
			targetHandler.getRecommendations(
				this.onRecommendationsSuccess.bind(this),
				this.onRecommendationError.bind(this)
			);
		},

		onRecommendationsSuccess: function(data) {
			if (data && data.errors && data.errors.length) {
				console.error("Unable to fetch data from target");
				return;
			}
			this.replaceData(this.$items, data);
		},

		onRecommendationError: function() {
			if (runmodeUtil.isAuthor()) {
				console.error("Unable to fetch data from target");
			}
		},

		replaceData: function($items, data) {
			data.forEach(function(newData, index) {
				if (this.isDataCorrect(newData)) {
					var $existingItem = this.findItem($items, newData.id);
					if ($existingItem.length) {
						$existingItem.insertBefore($(this.$items[index]));
						$existingItem.removeClass("is-hidden");
						targetHandler.trackClicks($existingItem);
					} else {
						var $item = $(this.$items[index]);
						api.replaceOrCopy($item, newData, this.$items);
					}
					this.refreshItems();
				}
			}.bind(this));
		},

		findItem: function($items, ean) {
			return $($items.filter(function() {
				return $(this).attr(ATTRIBUTES.ITEM_ATTR).includes(ean);
			}));
		},

		isDataCorrect: function(entity) {
			return entity.id !== "" && entity.name !== "";
		},

		refreshItems: function() {
			this.$items = this.$el.find(SELECTORS.LISTING_ITEM);
		}
	};

	api.replaceItem = function($item, newData) {
		api.findAndReplaceAttr($item, configSelectors.IMAGE, "src", newData.imageUrl);
		api.findAndReplaceAttr($item, configSelectors.IMAGE, "alt", newData.name);
		api.findAndReplaceText($item, configSelectors.TITLE_ANCHOR, newData.name);

		var pdpUrl = runmodeUtil.isPublish() ? newData.shortUrl : newData.longUrl;
		api.findAndReplaceAttr($item, configSelectors.TITLE_ANCHOR, "href", pdpUrl);
		api.findAndReplaceAttr($item, configSelectors.IMAGE_ANCHOR, "href", pdpUrl);
		api.findAndReplaceText($item, configSelectors.DESCRIPTION, newData.message);
		api.replaceQuickView($item, newData.id);
		api.findAndReplaceAttr($item, configSelectors.RATINGS, attributes.RATINGS_ID, newData.id);
		api.replaceFavourites($item, newData.id);
	};

	api.replaceOrCopy = function($item, newData, $items) {
		if (!$item.length) {
			var $firstItem = $($items[0]);
			$item = $firstItem.clone(true).appendTo($firstItem.parent());
		}
		api.replaceItem($item, newData);
		targetHandler.trackClicks($item);
	};

	api.findAndReplaceAttr = function($rootItem, selector, attribute, newValue) {
		$rootItem.find(selector).attr(attribute, newValue);
	};

	api.findAndReplaceText = function($rootItem, selector, newValue) {
		$rootItem.find(selector).text(newValue);
	};

	api.replaceQuickView = function($rootItem, ean) {
		var $quickView = $rootItem.find(configSelectors.QUICKVIEW);
		$quickView.attr(ATTRIBUTES.QUICKVIEW_ATTR, ean);
		var snippetPath = $quickView.attr(ATTRIBUTES.QUICKVIEW_SNIPPET_ATTR);
		var snippetPattern = /(.*product-quick-view\.)([0-9]+)(\.html)/;
		$quickView.attr(ATTRIBUTES.QUICKVIEW_SNIPPET_ATTR, snippetPath.replace(snippetPattern, "$1" + ean + "$3"));
	};

	api.replaceFavourites = function($rootItem, ean) {
		var $favourite = $rootItem.find(configSelectors.FAVOURITES);
		var dataOptions = JSON.parse($favourite.attr(ATTRIBUTES.FAVOURITES_OPTS_ATTR));
		dataOptions.itemId = ean;
		$favourite.attr(ATTRIBUTES.FAVOURITES_OPTS_ATTR, JSON.stringify(dataOptions));
		Cog.fireEvent("favourite", "REPAINT_FAVOURITE");
	};

	api.onRegister = function(scope) {
		targetHandler = this.external.targetHandler;
		configSelectors = this.external.listingSelectors.SELECTORS;
		attributes = this.external.listingSelectors.ATTRIBUTES;
		runmodeUtil = this.external.runmodeUtil;
		new DynamicListing(scope.$scope);
	};

	Cog.registerComponent({
		name: "listingDynamicData",
		api: api,
		selector: ".listing--dynamicData",
		requires: [
			{
				name: "target.handler",
				apiId: "targetHandler"
			},
			{
				name: "target.listingSelectors",
				apiId: "listingSelectors"
			},
			{
				name: "utils.status",
				apiId: "runmodeUtil"
			}
		]
	});
})(Cog.jQuery());
