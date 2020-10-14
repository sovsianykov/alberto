(function() {
	"use strict";

	var api = {};
	var utils;
	var ctConstants;
	var buyItNowHandler;

	api.init = function() {
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		buyItNowHandler = this.external.buyItNowHandler;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("priceSpider", "priceSpiderBINClick", priceSpiderBINClick);
			Cog.addListener("priceSpider", "sellerRedirectionClick", sellerRedirectionClick);
			Cog.addListener("priceSpider", "sizeVariantsClick", sizeVariantsClick);
			Cog.addListener("priceSpider", "directionLinkClick", directionLinkClick);
		}
	}

	function priceSpiderBINClick(event) {
		var analyticsProduct = utils.createProduct();
		analyticsProduct.attributes.integration = event.eventData.integration;
		utils.pushProduct(analyticsProduct);
		var eventData = event.eventData;
		var platformProduct = allProducts[eventData.productId] || {};
		var eventLabel = platformProduct.shortTitle;
		pushComponent(platformProduct);
		utils.pushComponent("PriceSpider", eventData.componentPosition, ctConstants.conversion, ctConstants.lead);
		var eventAction = buyItNowHandler.setEventActionIfIntent();
		utils.addTrackedEvent(eventAction, eventLabel, ctConstants.conversion, ctConstants.lead);
	}

	function sellerRedirectionClick(event) {
		var eventData = event.eventData;
		var productDetails = eventData.productDetails;
		var analyticsProduct = utils.createProduct();
		var products = [];
		analyticsProduct.productInfo = {
			productName: productDetails.productName,
			productID: productDetails.SKU,
			brand: productDetails.brandName,
			quantity: "",
			price: productDetails.price,
			sku: productDetails.SKU
		};
		analyticsProduct.category = {
			primaryCategory: ""
		};
		analyticsProduct.attributes = {
			listPosition: 4,
			productVariants: "",
			integrations: "PriceSpider"
		};
		products.push(analyticsProduct);
		pushProductInfo(analyticsProduct);
		var eventLabel = "Online - " + productDetails.productName + " | " + productDetails.sellerName;
		utils.pushComponent("PriceSpider", eventData.componentPosition, ctConstants.conversion, ctConstants.lead);
		utils.addTrackedEvent(ctConstants.retailerClick, eventLabel, ctConstants.conversion, ctConstants.lead);
	}

	function sizeVariantsClick(event) {
		var eventData = event.eventData;
		var eventLabel = eventData.productDetails.size;
		utils.pushComponent("PriceSpider", eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.filter, eventLabel, ctConstants.engagement, ctConstants.interest);
	}

	function directionLinkClick(event) {
		var eventData = event.eventData;
		var eventLabel = "PriceSpider - " + eventData.productDetails.productName + " - Postal code " + eventData.productDetails.storePostalCode;
		utils.pushComponent("PriceSpider", eventData.componentPosition, ctConstants.engagement, ctConstants.read);
		utils.addTrackedEvent(ctConstants.linkClick, eventLabel, ctConstants.engagement, ctConstants.read);
	}

	function pushComponent(platformProduct) {
		var analyticsProduct = utils.createProduct();
		var products = [];
		analyticsProduct.productInfo = {
			productName: platformProduct.shortTitle,
			productID: platformProduct.EAN,
			brand: digitalData.siteInfo.localbrand,
			quantity: 1,
			price: platformProduct.productPrice,
			sku: platformProduct.sku
		};
		analyticsProduct.category = {
			primaryCategory: platformProduct.category
		};
		analyticsProduct.attributes = {
			listPosition: 4,
			productVariants: platformProduct.sizes
		};
		products.push(analyticsProduct);
		pushProductInfo(analyticsProduct);
	}

	function pushProductInfo(products) {
		digitalData.product = [];
		digitalData.product = products;
	}

	Cog.registerStatic({
		name: "analytics.priceSpiderHandler",
		api: api,
		requires: [{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			},
			{
				name: "analytics.buyItNowHandler",
				apiId: "buyItNowHandler"
			}
		]
	});
}());
