/**
 * Listing button - show More
 */
(function() {
	"use strict";

	var analyticsDef;
	var analyticsUtils;
	var classes = {
		isHidden: "is-hidden"
	};
	var selectors = {
		listingItems: ".listing-item",
		promotileItem: ".promotile-item"
	};

	function ListingButton($el) {
		this.$el = $el;
		this.$button = this.$el.find(".show-more");
		this.$listing = this.$el.closest(".listing");
		this.$listingItems = this.$listing.find(".listing-item");

		this.listingLimit = parseInt(this.$button.attr("data-limit"), 10);
		this.showNextLimit = parseInt(this.$button.attr("data-to-show"), 10);
		this.listingType = this.$listing.data("itemtype") || "";
		this.buttonText = this.$el.text();
		this.componentPosition = analyticsUtils.getComponentPosition($el);
		this.hideToLimit();
		this.addHandlers();
		Cog.addListener("promotile", "PROMOTILE", function() {
			this.hideToLimit();
		}.bind(this));
	}

	ListingButton.prototype = {
		hideToLimit: function() {
			this.$listingItems = this.$listing.find(selectors.listingItems);
			var itemsShown = parseInt(this.$listing.attr("data-shown"), 10);
			var lastVisibleIndex = itemsShown ? itemsShown - 1 : this.listingLimit - 1;
			this.$listingItems.filter(":gt(" + lastVisibleIndex + ")").addClass(classes.isHidden);
			this.handleButtonVisibility();
		},

		showNext: function() {
			var $itemsToShow = this.$listingItems.filter(".is-hidden:lt(" + this.showNextLimit + ")");
			$itemsToShow.removeClass(classes.isHidden);
			this.$listing.attr("data-shown", this.$listingItems.filter(":not(.is-hidden)").length);
			this.trackImpression($itemsToShow);
			this.handleButtonVisibility();
			if ("c2bWidget" in window) {
				Cog.fireEvent("showMore", "REVEAL_NEXT");
			}
		},

		addHandlers: function() {
			this.$button.on("click", function() {
				this.$listingItems = this.$listing.find(selectors.listingItems);
				this.showNext();
				this.trackClick();
			}.bind(this));

			Cog.addListener("listingCheckBoxesFilter", "filterUpdate", function() {
				this.$listing.attr("data-shown", "");
			}.bind(this));
		},

		handleButtonVisibility: function() {
			if (this.$listingItems.filter(".is-hidden").length === 0) {
				this.$el.addClass(classes.isHidden);
			}
		},

		trackClick: function() {
			Cog.fireEvent("showMoreButton", analyticsDef.CLICK.LOAD_MORE_CLICK, {
				componentPosition: this.componentPosition,
				componentName: analyticsDef.ctConstants.listing,
				eventLabel: this.listingType.toUpperCase() || this.buttonText.trim()
			});
		},

		trackImpression: function($products) {
			if (this.listingType === analyticsDef.ctConstants.product) {
				Cog.fireEvent("listing", analyticsDef.ctConstants.productImpression, {
					products: $products.not(selectors.promotileItem),
					componentPosition: this.componentPosition,
					componentName: analyticsDef.ctConstants.listing
				});
			}
		}
	};

	var api = {
		onRegister: function(scope) {
			analyticsDef = this.external.eventsDefinition;
			analyticsUtils = this.external.utils;

			new ListingButton(scope.$scope);
		}
	};

	Cog.registerComponent({
		name: "listingButton",
		api: api,
		selector: ".listingButton",
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]
	});
}());
