(function($) {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;

	function ListingProductVariants($el) {
		this.$variantLists = $el.find(".productVariantList");
		this.$listingItems = $el.find(".listing-item");
		this.componentPosition = analyticsUtils.getComponentPosition(this.$variantLists);

		if (this.$variantLists.length !== 0) {
			this.initialize();
			this.bindUIEvents();
		}
	}

	ListingProductVariants.prototype = {
		initialize: function() {
			var urlHash = location.hash.substr(1);

			function processRatingStars($rating, listingItemIndex) {
				// input;  <div><svg><path style="fill: url(#foo)"/><linearGradient id="foo"/></svg>...</div>
				// output; <div><svg><path style="fill: url(#foo-123123)"/><linearGradient id="foo-123123"/></svg>...</div>
				// the IDs need to be unique on the page, so the SVG will
				// be able to find the gradients
				var updateBackgroundID = function(i, el) {
					var $el = $(el);
					var $linearGradient = $el.find("linearGradient[id]");
					var id = $linearGradient.attr("id");
					var newId = id + "-" + (+ (new Date())) + "-" + listingItemIndex;
					var $updateEls = $el.children("[style*='#" + id + "']");

					$linearGradient.attr("id", newId);
					$updateEls.each(function(i, el) {
						$(el).attr("style","fill: url(#" + newId + ") !important");
					});
				};
				var $svgs = $rating.find("svg");
				$svgs.each(updateBackgroundID);
				return $rating;
			}

			$.each(this.$listingItems, function(listingItemIndex, listingItem) {
				var ratings = $(listingItem).find(".ratingsandreviews");
				$(this).attr("data-ean", $(listingItem).find(".productVariantList > .component-content").data("ean"));
				if (ratings.length) {
					processRatingStars(ratings, listingItemIndex);
				}
			});

			this.markActive(urlHash);
		},
		bindUIEvents: function() {
			this.$variantLists.on("click", ".productVariantList-link", function(event) {
				var ean = $(event.target).attr("href").substr(1);
				Cog.fireEvent("productVariant",
					analyticsDef.CLICK.PRODUCT_VARIANT_CLICK, {
						componentPosition: this.componentPosition,
						ean: ean
					});

				Cog.fireEvent("priceSpider", "PRICE_SPIDER_LAZY_LOAD");
			}.bind(this));
			$(window).on("hashchange", function() {
				var ean = location.hash.substr(1);
				if (ean) {
					this.markActive(ean);
				}
			}.bind(this));
		},
		markActive: function(ean) {
			if (this.$listingItems.filter("[data-ean='" + ean + "']").length > 0) {
				showVariantByEan(this.$listingItems, this.$variantLists, ean);
			} else {
				showParentVariant(this.$listingItems, this.$variantLists);
			}

			function showVariantByEan($listingItems, $variantLists, ean) {
				$listingItems.addClass("is-hidden")
					.filter("[data-ean='" + ean + "']")
					.removeClass("is-hidden");

				$.each($variantLists, function() {
					$(this).find(".productVariantList-link")
						.removeClass("is-active")
						.filter("[href='#" + ean + "']")
						.addClass("is-active");
				});
			}

			function showParentVariant($listingItems, $variantLists) {
				$listingItems.addClass("is-hidden")
					.first().removeClass("is-hidden");

				$.each($variantLists, function() {
					var $links = $(this).find(".productVariantList-link");
					$links.removeClass("is-active");
					$links.filter(".productVariantList-parent-product").addClass("is-active");
				});
			}
		}
	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;

		new ListingProductVariants(scope.$scope);
	};

	Cog.registerComponent({
		name: "listing-product-variants",
		api: api,
		selector: ".listing--product-variants",
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
})(Cog.jQuery());
