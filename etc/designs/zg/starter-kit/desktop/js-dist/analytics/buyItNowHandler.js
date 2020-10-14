(function() {
	"use strict";

	var api = {};
	var events;
	var utils;
	var ctConstants;
	var queryString;
	var sharedApi = {};

	api.init = function() {
		events = this.external.eventsDefinition;
		utils = this.external.utils;
		queryString = this.external.querystring;
		ctConstants = this.external.eventsDefinition.ctConstants;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("buyitnow", events.CLICK.BIN_CLICK, binClick);
			Cog.addListener("buyitnow", events.CLICK.CARTWIRE_RETAILER_CLICK, binClick);
			Cog.addListener("buyitnow", events.LOAD.PDP_PAGE_LOAD, sharedApi.loadBinWidgetIfIntentIsPurchase);
		}
	}

	sharedApi.loadBinWidgetIfIntentIsPurchase = function(event) {
		var intenToBuy = queryString.getFromQueryString("intent");
		if (intenToBuy === "purchase") {
			if (event.eventData.component === "Shopalyst") {
				binClick(event);
			} else if (event.eventData.component === "PriceSpider") {
				var timer;
				var count = 0;
				timer = setInterval(function() {
					if (count > 15) {
						clearInterval(timer);
					} else if (event.eventData.element && count > 5) {
						event.eventData.element.click();
						count += 5;
					}
					count++;
				}.bind(this), 1000);
			} else {
				event.eventData.element.click();
			}
		}
	};

	sharedApi.setEventActionIfIntent = function() {
		var intenToBuy = queryString.getFromQueryString("intent");
		if (intenToBuy === "purchase") {
			return ctConstants.purchaseIntent;
		} else {
			return ctConstants.purchase;
		}
	};

	function binClick(event) {
		var analyticsProduct = utils.createProduct();
		var eventLabel;
		var platformProduct;
		var eventData = {
			category: ctConstants.conversion,
			subCategory: ctConstants.lead
		};
		eventData.action = sharedApi.setEventActionIfIntent();
		var products = [];
		if (event.eventData.retailerClick && event.eventData.component === "Cartwire") {
			platformProduct = event.eventData.product;
			eventLabel = "Online - " + platformProduct.productName + " | " + platformProduct.retailerName;
			eventData.action = events.ctConstants.retailerClick;
			analyticsProduct.productInfo.productName = platformProduct.productName;
			analyticsProduct.productInfo.productID = platformProduct.productId;
			analyticsProduct.productInfo.productBrand = platformProduct.brandName;
			analyticsProduct.productInfo.price = platformProduct.cwPriSymTemp;
			analyticsProduct.productInfo.quantity = platformProduct.quantity;
			analyticsProduct.productInfo.country = platformProduct.country;
			analyticsProduct.attributes.productVariants = platformProduct.productVariant;
		} else {
			platformProduct = allProducts[event.eventData.product] || {};
			eventLabel = "Online - " + platformProduct.shortTitle;
			eventData.action = events.ctConstants.purchase;
			analyticsProduct.productInfo.productName = platformProduct.shortTitle;
			analyticsProduct.productInfo.productID = platformProduct.EAN;
			analyticsProduct.productInfo.productBrand = digitalData.siteInfo.localbrand;
			analyticsProduct.productInfo.price = platformProduct.productPrice;
			analyticsProduct.productInfo.sku = platformProduct.sku;
			analyticsProduct.attributes.pcatName = platformProduct.category;
			analyticsProduct.attributes.productVariants = platformProduct.sizes;
		}
		analyticsProduct.attributes.integration = event.eventData.integration;
		analyticsProduct.attributes.country = platformProduct.country;
		analyticsProduct.attributes.productRetailer = platformProduct.retailerName;
		eventData.label = eventLabel;
		analyticsProduct.category.primaryCategory = platformProduct.category;
		products.push(analyticsProduct);
		pushCartEvent(products, eventData, event.eventData.component);
		digitalData.product.unshift(analyticsProduct);
	}

	function pushCartEvent(cartProducts, event, componentName) {
		digitalData.cart = [];
		digitalData.cart.item = [];
		utils.pushCart(cartProducts);
		utils.pushComponent(componentName, "");
		utils.addTrackedEvent(event.action, event.label, event.category, event.subCategory);
	}

	Cog.registerStatic({
		name: "analytics.buyItNowHandler",
		api: api,
		sharedApi: sharedApi,
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
				name: "utils.querystring",
				apiId: "querystring"
			}
		]
	});
}());
