/**
 * Listing - configure selectors for Target in the listing
 */

(function() {
	"use strict";

	var api = {};
	var	sharedApi = {};

	//every selector is described from perspective of .listing-item element
	sharedApi.SELECTORS = {
		IMAGE: "img",
		IMAGE_ANCHOR: ".image a",
		TITLE_ANCHOR: "h3 a",
		DESCRIPTION: ".richText-content p",
		QUICKVIEW: ".productQuickView button",
		RATINGS: ".ratingsandreviews [data-bv-product-id]",
		FAVOURITES: ".favourite meta"
	};

	sharedApi.ATTRIBUTES = {
		RATINGS_ID: "data-bv-product-id"
	};

	Cog.registerStatic({
		name: "target.listingSelectors",
		api: api,
		sharedApi: sharedApi
	});
})();
