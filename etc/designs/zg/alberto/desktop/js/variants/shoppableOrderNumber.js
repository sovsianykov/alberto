(function($) {
	"use strict";

	// Script adding the Shoppable order ID to the text of an element
	// which has the .text-shoppable-order-number selection style applied.
	// The ID is taken from the query parameters that are coming from Shoppable.
	// Additionally it tracks the checkout in Olapic.

	var api = {};
	var orderNumber = getUrlParameter("oid");
	var $olapicAnalyticsData = $("[name='olapic-checkout-analytics-data']");
	var olapicEnabled = $olapicAnalyticsData.attr("data-social-aggregation-provider") === "Olapic";
	var olapicApiKey = $olapicAnalyticsData.attr("data-olapic-api-key");
	var shoppableAuthToken = $olapicAnalyticsData.attr("data-shoppable-auth-token");
	var eventsDefinition;

	function getUrlParameter(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
		var results = regex.exec(location.search);

		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	function readDataAndTrackCheckout(orderNumber) {
		readProducts(orderNumber,
				function(products) {
					readProductsDetailsMap(products, function(productsDetailsMap) {
						if (olapicEnabled) {
							trackCheckout(products, productsDetailsMap, orderNumber);
						}
					});
					products = products || {};
					sendAnalyticsData(orderNumber, products);
				},
				function() {
					sendAnalyticsData(orderNumber, {});
					console.log("Reading products for order number: " + orderNumber + " failed");
				});
	}

	function setAuthToken(xhr) {
		xhr.setRequestHeader("Authorization", "Bearer " + shoppableAuthToken);
	}

	function readProducts(orderNumber, successCallback, failCallback) {
		$.ajax({
			url: getShoppableRootUri() + "/v3/order/" + orderNumber,
			beforeSend: setAuthToken,
			success: successCallback,
			error: failCallback
		});
	}

	function readProductsDetailsMap(products, successCallback) {
		var partNumbers = products.map(function(product) {
			return product.part_number;
		}).join(",");

		$.ajax({
			url: getShoppableRootUri() + "/v3/product?part_numbers=" + partNumbers,
			beforeSend: setAuthToken,
			success: function(productsDetails) {
				var productsDetailsMap = getProductDetailsMap(products, productsDetails);
				successCallback(productsDetailsMap);
			},
			error: function() {
				console.log("Reading products for partNumbers: " + partNumbers + " failed");
			}
		});
	}

	function getShoppableRootUri() {
		var defaultUri = "//api.shoppable.com";
		return ShoppableApi ? ShoppableApi.framesApiCall || defaultUri : defaultUri;
	}

	function getProductDetailsMap(products, productsDetails) {
		var productsDetailsMap = {};
		if (products.length === 1) {
			productsDetails = [productsDetails];
		} else {
			productsDetails = productsDetails[0];
		}
		productsDetails.forEach(function(productData) {
			productData.colors.forEach(function(color) {
				color.sizes.forEach(function(size) {
					productsDetailsMap[size.id] = size;
				});
			});
		});
		return productsDetailsMap;
	}

	function trackCheckout(products, productsDetailsMap, orderNumber) {
		olapicRequireCheckoutScript(
			"//photorankstatics-a.akamaihd.net/static/frontend/checkout/olapic.checkout.helper.js",
			function() {
				olapicCheckout.init(olapicApiKey);

				products.forEach(function(product) {
					for (var i = 0; i < product.quantity; i++) {
						var productDetails = productsDetailsMap[product.sku];
						olapicCheckout.addProduct(productDetails.upc, product.price);
					}
				});

				olapicCheckout.addAttribute("transactionId", orderNumber);
				olapicCheckout.addAttribute("currencyCode", (products[0] && products[0].currency) ||
					"USD");

				olapicCheckout.execute();
			});
	}

	function sendAnalyticsData(orderNumber, products) {
		Cog.fireEvent("shoppable", eventsDefinition.SHOPPABLE_PURCHASE, {
			orderNumber: orderNumber,
			products: products
		});
	}

	api.onRegister = function(element) {
		var $elem = element.$scope;
		var text = $elem.text();
		eventsDefinition = this.external.eventsDefinition.OTHER;

		$elem.text(text + orderNumber);
		readDataAndTrackCheckout(orderNumber);
	};

	Cog.registerComponent({
		name: "shoppableOrderNumber",
		api: api,
		selector: ".text-shoppable-order-number",
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			}
		]
	});

})(Cog.jQuery());
