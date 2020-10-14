(function($) {
	"use strict";

	var api = {};
	var utils;
	var urlUtils;
	var ctConstants;
	var attributes;

	var expectedListings = 0;
	var listingsReady = 0;
	var impressionProducts = [];

	var NOT_APPLICABLE = "(not set)";

	api.init = function() {
		utils = this.external.utils;
		urlUtils = this.external.urlUtils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		findListings();
		Cog.addListener("listing", "READY", onListingReady);
		attributes = {
			nonInteractive: {
				nonInteraction: 1
			}
		};
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("filters", "analytics", onFilter);
			Cog.addListener("listing", ctConstants.productImpression, onInstantImpresssion);
		}
	}

	function onFilter(event) {
		utils.pushComponent(event.eventData.componentName, event.eventData.componentPosition);
		utils.addTrackedEvent(ctConstants.filter, event.eventData.filters, ctConstants.engagement, ctConstants.interest);
	}

	function onInstantImpresssion(event) {
		var productNames = [];
		var products = event.eventData.products.not(".promotile-item");

		$.each(products, function() {
			var ean;

			if (event.eventData.componentName === ctConstants.listing) {
				ean = utils.resolveListingProductEan($(this));
			} else if (event.eventData.componentName === ctConstants.searchResults) {
				ean = utils.resolveSearchProductEan($(this));
			}

			if (allProducts[ean]) {
				var product = utils.createProduct(allProducts[ean]);

				utils.pushProduct(product);
				productNames.push(product.productInfo.productName);
			}
		});

		utils.pushComponent(event.eventData.componentName, event.eventData.componentPosition);
		utils.addTrackedEvent(ctConstants.productImpression, productNames, ctConstants.custom, ctConstants.lead, attributes);
	}

	function onListingReady(event) {
		var $listingProducts = event.eventData.$listingProducts;
		$.each($listingProducts, function() {
			var ean = utils.resolveListingProductEan($(this));
			if (allProducts[ean]) {
				var product = utils.createProduct(allProducts[ean]);
				utils.pushProduct(product);
				impressionProducts.push(
					product.productInfo.productName);
			}
		});
		listingsReady++;
		onLoadImpression();
	}

	function onLoadImpression() {
		// Don't fire here if there is an 'order' query parameter.
		// ListingFilter.js will fire ctConstants.productImpression when filter is ready
		if (impressionReady() && impressionProducts && !urlUtils.getQueryParams(null, true).order) {
			utils.pushComponent("Listing", NOT_APPLICABLE);
			utils.addTrackedEvent(ctConstants.productImpression, impressionProducts,
				ctConstants.custom, ctConstants.lead, attributes);
			impressionProducts = [];
		}
	}

	function findListings() {
		expectedListings = $("div.listing:not(.listing--product-variants, .listing--snippet)[data-id=product]").length;
	}

	function impressionReady() {
		return expectedListings === listingsReady;
	}

	Cog.registerStatic({
		name: "analytics.listingHandlers",
		api: api,
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			},
			{
				name: "utils.url",
				apiId: "urlUtils"
			}
		]
	});
})(Cog.jQuery());
