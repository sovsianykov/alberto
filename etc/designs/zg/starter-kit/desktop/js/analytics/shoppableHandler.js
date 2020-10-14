(function($) {
	"use strict";

	var api = {};
	var events;
	var utils;
	var objectHelper;
	var ctConstants;
	var listenersAttached = false;
	var continueButtonClass = ".shopping-bag-continue-link";
	var cartViewButtonClass = ".shoppable-view-cart-button";
	var checkoutButtonClass = ".shopping-bag-checkout-link";
	var closeMiniBagClass = ".shoppable-checkout-close-button";
	var isMiniBagOpen = false;
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
			Cog.addListener("shoppable", events.OTHER.SHOPPABLE_INIT, addShoppableListeners);
			Cog.addListener("shoppable", events.OTHER.SHOPPABLE_PURCHASE, trackPurchase);
		}
	}

	function addShoppableListeners() {
		if (!listenersAttached && typeof jQuery !== "undefined" && typeof jQuery.Topic !== "undefined") {
			//we use jQuery object because this is shoppable's jQuery with Topic implementation
			jQuery.Topic("ADD_TO_CART").subscribe(addToCartClick);
			jQuery.Topic("FOUND_CART").subscribe(saveCartState);
			jQuery.Topic("REMOVE_FROM_CART").subscribe(removeFromCartClick);
			jQuery.Topic("OPEN_CART").subscribe(openCartClick);
			jQuery.Topic("CLOSE_CART").subscribe(closeCartClick);

			$(continueButtonClass).click(continueClick);
			$(checkoutButtonClass).click(checkoutClick);
			//button shows in markup after first bag opening, so this way to handle event is necessary
			$(document).on("click", cartViewButtonClass, cartViewClick);
			$(document).on("click", closeMiniBagClass, closeCartClick);
			listenersAttached = true;
		}
	}

	function saveCartState(currentCart) {
		previousCart = parseCart(currentCart);
	}

	function addToCartClick(currentCart) {
		var currentCartJson = JSON.parse(currentCart);
		var products = parseCart(currentCart);
		if (objectHelper.has(currentCartJson, "event.lastQtyAdded")) {
			var eventLabel = currentCartJson.event.lastQtyAdded.name;
			var event = {
				action: ctConstants.addtoCart,
				label: eventLabel,
				category: ctConstants.conversion,
				subCategory: ctConstants.lead
			};

			pushCartEvent(products, event);
		}
	}

	function removeFromCartClick(currentCart) {
		var products = parseCart(currentCart);
		products = _.differenceWith(previousCart, products, _.isEqual);

		var productNames = products.map(function(elem) {
			return elem.productInfo.productName;
		}).join(" | ");

		var eventLabel = "Remove items - " + productNames;
		var event = {
			action: ctConstants.removecart,
			label: eventLabel,
			category: ctConstants.conversion,
			subCategory: ctConstants.diversion
		};

		pushCartEvent(products, event);
	}

	function openCartClick() {
		if (!isMiniBagOpen) {
			isMiniBagOpen = true;
			toggleCartClick("Open");
		}
	}

	function closeCartClick() {
		if (isMiniBagOpen) {
			isMiniBagOpen = false;
			toggleCartClick("Close");
		}
	}

	function cartViewClick() {
		utils.pushComponent("Shoppable", "");
		utils.addTrackedEvent(ctConstants.viewBag,
				document.title,
				ctConstants.conversion,
				ctConstants.read);
	}

	function toggleCartClick(eventLabel) {
		utils.pushComponent("Shoppable", "");
		utils.addTrackedEvent(ctConstants.miniBag,
			eventLabel,
			ctConstants.conversion,
			ctConstants.interest);
	}

	function continueClick() {
		utils.pushComponent("Shoppable","");
		utils.addTrackedEvent(ctConstants.continueShopping,
			"Continue shopping",
			ctConstants.conversion,
			ctConstants.interest);
	}

	function checkoutClick() {
		var eventLabel = "Checkout click";
		var event = {
			action: ctConstants.checkoutenhanced,
			label: eventLabel,
			category: ctConstants.conversion,
			subCategory: ctConstants.win
		};
		pushCartEvent(previousCart, event);
	}

	function trackPurchase(event) {
		var eventLabelOrderSummary = event.eventData.orderNumber;
		var eventLabelPurchase = [];
		var products = [];
		digitalData.transaction = [];
		digitalData.transaction.item = [];
		digitalData.transaction.total = {};
		digitalData.transaction.transactionID = event.eventData.orderNumber;
		digitalData.transaction.total.voucherCode = "voucher Code";

		$.each(event.eventData.products, function(index, item) {
			var product = utils.createProduct();
			product.productInfo.productID = item.upc || "";
			product.productInfo.productName = item.product_name || "";
			product.productInfo.sku = item.sku || "";
			product.productInfo.quantity = item.quantity || "";
			product.price.basePrice = item.item_total || "";
			product.productInfo.voucherCode = "voucher Code";
			product.attributes.productRetailer = item.merchant || "";
			product.attributes.productBrand = item.brand || "";
			product.attributes.onlineStore = "Online Store";
			product.attributes.paymentMethod = "Payment Method";

			products.push(product);
			if (item.product_name) {
				eventLabelPurchase.push(item.product_name);
			}
		});

		digitalData.transaction.item = products;
		utils.pushComponent("Shoppable", "");
		utils.addTrackedEvent(ctConstants.purchaseenhanced,
			eventLabelPurchase,
			ctConstants.conversion,
			ctConstants.win, {
				nonInteractive: {
					nonInteraction: 1
				}
			});
		utils.addTrackedEvent(ctConstants.ordersummary,
			eventLabelOrderSummary,
			ctConstants.conversion,
			ctConstants.win, {
				nonInteractive: {
					nonInteraction: 1
				}
			});
	}

	function pushCartEvent(cartProducts, event) {
		digitalData.cart = [];
		digitalData.cart.item = [];
		utils.pushCart(cartProducts);
		utils.pushComponent("Shoppable", "");
		utils.addTrackedEvent(event.action, event.label, event.category, event.subCategory);
	}

	function parseCart(cart) {
		cart = JSON.parse(cart);
		var products = [];
		if (cart.merchants) {
			$.each(cart.merchants, function(index, merchant) {
				$.each(merchant.items, function(index, item) {
					var product = utils.createProduct();
					product.productInfo.productID = item.upc;
					product.attributes.productRetailer = merchant.name;
					product.productInfo.productName = item.name;
					product.productInfo.price = item.price;
					product.productInfo.brand = item.brand;
					product.productInfo.quantity = item.qty;
					product.attributes.productBrand = item.brand;

					products.push(product);
				});
			});
		}
		return products;
	}

	Cog.registerStatic({
		name: "analytics.shoppableHandler",
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
				name: "utils.objectHelper",
				apiId: "objectHelper"
			}
		]
	});
}(Cog.jQuery()));
