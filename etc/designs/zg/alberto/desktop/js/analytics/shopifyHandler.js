(function($) {
	"use strict";

	var api = {};
	var events;
	var utils;
	var objectHelper;
	var ctConstants;
	//keeping the cart state (needed for identifying deleted products)
	var previousCart = [];

	api.init = function() {
		events = this.external.eventsDefinition;
		objectHelper = this.external.objectHelper;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("shopify.analytics", "saveCartState", saveCartState);
			Cog.addListener("shopify.analytics", "addToCart", addToCart);
			Cog.addListener("shopify.analytics", "removeCart", removeFromCartClick);
			Cog.addListener("shopify.analytics", "miniBagClick", trackMiniBagClick);
			Cog.addListener("shopify.analytics", "continueShopping", continueShopping);
			Cog.addListener("shopify.analytics", "cartPageLoad", cartPageLoad);
			Cog.addListener("shopify.analytics", "orderSummery", orderSummery);
			Cog.addListener("shopify.analytics", "thankYouPage", thankyouPage);
			Cog.addListener("shopify.analytics", "checkoutPage", checkoutPage);
		}
	}

	function checkoutPage(event) {
		var eventLabel = "Check Out";
		utils.addTrackedEvent(ctConstants.checkoutenhanced, eventLabel, ctConstants.conversion,
			ctConstants.win, {}, ctConstants.trackEvent);
		utils.pushComponent("Shopify", event.eventData.componentPosition, ctConstants.conversion,
			ctConstants.win);
	}

	function thankyouPage(event) {
		var responseData = event.eventData.response.responseData;
		var products = responseData.items;
		var eventLabel = products.map(function(product) {
			return product.name;
		}).join(" | ");
		trackPurchase(responseData);
		utils.addTrackedEvent(ctConstants.purchaseenhanced, eventLabel, ctConstants.conversion,
			ctConstants.win, {}, ctConstants.trackEvent);
		utils.pushComponent("Shopify", event.eventData.componentPosition, ctConstants.conversion,
			ctConstants.win);
	}

	function trackPurchase(orderDetails) {
		var products = [];
		digitalData.transaction = [];
		digitalData.transaction.item = [];
		digitalData.transaction.total = {};
		digitalData.transaction.transactionID = orderDetails.cart.id;
		digitalData.transaction.total.voucherCode = "Voucher Code";

		$.each(orderDetails.items, function(index, item) {
			var product = utils.createProduct();
			product.productInfo = {
				productID: item.id || "",
				productName: item.name || "",
				sku: item.sku || "",
				quantity: item.quantity || ""
			};
			product.price = {
				basePrice: item.total,
				voucherCode: "Voucher Code"
			};
			product.attributes = {
				pcatName: "",
				pcatValue: "",
				productRetailer: "",
				productBrand: digitalData.siteInfo.localbrand,
				onlineStore: "Online Store",
				paymentMethod: orderDetails.shippingLine[0].title
			};
			products.push(product);
		});
		updateDigitalDataTransactionObject(products);
	}

	function orderSummery(event) {
		var orderDetails = event.eventData.response.responseData;
		var eventLabel;
		for (var prop in orderDetails) {
			if (prop === "order-id") {
				eventLabel = orderDetails[prop];
			}
		}
		var attributes = {
			nonInteractive: {
				nonInteraction: 1
			}
		};
		trackPurchase(orderDetails);
		utils.addTrackedEvent(ctConstants.ordersummary, eventLabel, ctConstants.conversion,
			ctConstants.win, attributes, ctConstants.trackEvent);
		utils.pushComponent("Shopify", event.eventData.componentPosition, ctConstants.conversion,
			ctConstants.win);
	}

	function cartPageLoad(event) {
		var products = event.eventData.response.responseData.items;
		pushData(products);
		var eventLabel = products.map(function(product) {
			return product.productEan;
		}).join(" | ");
		utils.addTrackedEvent(ctConstants.cartView, eventLabel, ctConstants.conversion,
			ctConstants.lead, {}, ctConstants.trackEvent);
		utils.pushComponent("Shopify", event.eventData.componentPosition, ctConstants.conversion,
			ctConstants.lead);
	}

	function saveCartState(event) {
		previousCart = event.eventData;
	}

	function continueShopping(event) {
		var eventLabel = "Continue Shopping";
		utils.addTrackedEvent(ctConstants.continueShopping, eventLabel, ctConstants.conversion,
			ctConstants.interest, {}, ctConstants.trackEvent);
		utils.pushComponent("Shopify", event.eventData.componentPosition, ctConstants.conversion,
			ctConstants.interest);
	}

	function trackMiniBagClick(event) {
		var eventLabel = "Open | Close";
		utils.addTrackedEvent(ctConstants.miniBag, eventLabel, ctConstants.conversion,
			ctConstants.interest, {}, ctConstants.trackEvent);
		utils.pushComponent("Shopify", event.eventData.componentPosition, ctConstants.conversion,
			ctConstants.interest);
	}

	function removeFromCartClick(event) {
		var products = JSON.parse(event.eventData.response);
		products = products.responseData.items;
		pushData(products);
		products = _.differenceWith(previousCart, products, _.isEqual);
		var productNames = products.map(function(elem) {
			return elem.name;
		}).join(" | ");
		var eventLabel = "Remove items - " + productNames;
		utils.addTrackedEvent(ctConstants.removecart, eventLabel, ctConstants.conversion,
			ctConstants.diversion, {}, ctConstants.trackEvent);
		utils.pushComponent("Shopify", event.eventData.componentPosition, ctConstants.conversion,
			ctConstants.diversion);
	}

	function addToCart(event) {
		var productData = allProducts[event.eventData.productEan] || {};
		var eventLabel = productData.shortTitle;
		utils.addTrackedEvent(ctConstants.addtoCart, eventLabel, ctConstants.conversion,
			ctConstants.lead, {}, ctConstants.trackEvent);
		addToCartPushData(event);
		utils.pushComponent("Shopify", event.eventData.componentPosition, ctConstants.conversion,
			ctConstants.lead);
	}

	function pushData(productsList) {
		var products = [];
		$.each(productsList, function(index, item) {
			var analyticsProduct = utils.createProduct();
			var platformProduct = allProducts[item.productEan] || {};
			analyticsProduct.productInfo = {
				productName: item.name,
				productID: item.productEan,
				productBrand: digitalData.siteInfo.localbrand,
				price: item.total,
				sku: platformProduct.sku,
				quantity: item.quantity
			};
			analyticsProduct.category = {
				primaryCategory: platformProduct.category
			};
			analyticsProduct.price = {
				voucherCode: "Voucher Code"
			};
			analyticsProduct.attributes = {
				pcatName: platformProduct.category,
				productVariants: platformProduct.sizes,
				pcatValue: "",
				listPosition: 4,
				productRetailer: "",
				productBrand: digitalData.siteInfo.localbrand
			};
			products.push(analyticsProduct);
		});
		updateDigitalDataCartObject(products);
	}

	function addToCartPushData(event) {
		var analyticsProduct = utils.createProduct();
		var eventData = event.eventData;
		var platformProduct = allProducts[eventData.productEan] || {};
		var products = [];
		analyticsProduct.productInfo = {
			productName: platformProduct.shortTitle,
			productID: platformProduct.EAN,
			productBrand: digitalData.siteInfo.localbrand,
			price: platformProduct.productPrice,
			sku: platformProduct.sku,
			quantity: eventData.quantity
		};
		analyticsProduct.category = {
			primaryCategory: platformProduct.category
		};
		analyticsProduct.price = {
			voucherCode: "Voucher Code"
		};
		analyticsProduct.attributes = {
			pcatName: platformProduct.category,
			productVariants: platformProduct.sizes,
			pcatValue: "",
			listPosition: 4,
			productRetailer: "",
			productBrand: digitalData.siteInfo.localbrand
		};
		products.push(analyticsProduct);
		updateDigitalDataCartObject(products);
	}

	function updateDigitalDataCartObject(products) {
		digitalData.cart = [];
		digitalData.cart.item = [];
		digitalData.cart.item = products;
	}

	function updateDigitalDataTransactionObject(products) {
		digitalData.transaction = [];
		digitalData.transaction.item = [];
		digitalData.transaction.item = products;
	}

	Cog.registerStatic({
		name: "analytics.shopifyHandler",
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
				name: "utils.objectHelper",
				apiId: "objectHelper"
			}
		]
	});
}(Cog.jQuery()));
