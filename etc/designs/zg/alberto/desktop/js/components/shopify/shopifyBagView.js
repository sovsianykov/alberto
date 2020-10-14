(function($) {
	"use strict";

	var api = {};
	var eventsDefinition = {};
	var analyticsUtils = {};
	var breakpoints;
	var CART_ENDPOINT = "/sk-eu/services/shopify/cart";
	var classes = {
		BRAND_INPUT: "input[name=brand]",
		CART_ITEM_CONTAINER: ".bag-item",
		CART_QUANTITY: "span.bag-quantity",
		CART_SUBTOTAL: "span.bag-subtotal",
		CART_TAX: "span.bag-tax",
		CART_TOTAL: "span.bag-total",
		ITEM_QUANTITY: "span.item-quantity",
		ITEM_SUBTOTAL: "span.item-subtotal",
		LOCALE_INPUT: "input[name=locale]",
		QUANTITY_SELECT: "select[name=quantity]",
		DELIVERY_CHARGES: ".bag-delivery-charges",
		REMOVE_FROM_CART: "a.bag-remove",
		BASKET_ICON: ".shopify-basket__quantity",
		BAG_VIEW_TOGGLE_MOBILE: ".bag-view-toggle-button",
		CUSTOMER_INFORMATION: ".shopify-customer-information",
		ERROR_NOTIFICATION: ".shopify-error",
		ERROR_CLOSE: ".shopify-error__close",
		BAG_VIEW: ".shopify-bag-view",
		BODY: "body",
		CONTINUE_SHOPPING_BUTTON: ".shopify-continue-button"
	};

	function ShopifyBagView($el, status) {
		this.$el = $el;
		this.status = status;
		this.$cartQuantity = $el.find(classes.CART_QUANTITY);
		this.$cartSubtotal = $el.find(classes.CART_SUBTOTAL);
		this.$cartTax = $el.find(classes.CART_TAX);
		this.$cartTotal = $el.find(classes.CART_TOTAL);
		this.brand = $el.find(classes.BRAND_INPUT).val();
		this.locale = $el.find(classes.LOCALE_INPUT).val();
		this.$removeFromCartButtons = $el.find(classes.REMOVE_FROM_CART);
		this.$quantitySelects = $el.find(classes.QUANTITY_SELECT);
		this.$bagViewToggleMobile = $el.find(classes.BAG_VIEW_TOGGLE_MOBILE);
		this.$customerInformation = $(classes.CUSTOMER_INFORMATION);
		this.$deliveryCharges = $el.find(classes.DELIVERY_CHARGES);
		this.$deliveryCharges = $el.find(classes.DELIVERY_CHARGES);
		this.errorMessage = $el.find(classes.BAG_VIEW).data("errormessage");

		this.componentPosition = analyticsUtils.getComponentPosition(this.$el);
		this.bindUIEvents();

	}

	ShopifyBagView.prototype = {

		bindUIEvents: function() {

			$(document).on("click", classes.ERROR_CLOSE, function() {
				this.closeErrorNotification();
			}.bind(this));

			$(document).on("click", classes.CONTINUE_SHOPPING_BUTTON, function() {
				Cog.fireEvent("shopify.analytics", "continueShopping",{
					componentPosition: this.componentPosition
				});
			}.bind(this));

			this.$removeFromCartButtons.on("click", function(event) {
				var $target = $(event.target);
				var formData = this.prepareRequest("delete",{
					lineItemId: $target.attr("data-id")
				});
				$.ajax({
					url: CART_ENDPOINT,
					context: this,
					contentType: false,
					processData: false,
					method: "post",
					data: formData,
					success: function(response) {
						$target.closest(classes.CART_ITEM_CONTAINER).remove();
						Cog.fireEvent("shopify.analytics", "removeCart", {
							response: response,
							componentPosition: this.componentPosition
						});
						this.updateCartInfo(response);
					},
					error: function() {
						Cog.fireEvent("Shopify", "shopifyAddErrorMessage", this.errorMessage);
					}
				});
			}.bind(this));

			this.$quantitySelects.on("change", function(event) {
				var $target = $(event.target);
				var formData = this.prepareRequest(
					"update", {
						lineItemId: $target.attr("data-id"),
						quantity: parseInt($target.val(), 10)
					});
				$.ajax({
					url: CART_ENDPOINT,
					context: this,
					contentType: false,
					processData: false,
					method: "post",
					data: formData,
					success: function(response) {
						this.updateCartInfo(response);
						this.updateCartItemInfo(
							$target.closest(classes.CART_ITEM_CONTAINER),
							$target.attr("data-id"),
							response);
						var successResponse = JSON.parse(response);
						successResponse = successResponse.responseData.items;
						Cog.fireEvent("shopify.analytics", "saveCartState", successResponse);
					},
					error: function() {
						Cog.fireEvent("Shopify", "shopifyAddErrorMessage", this.errorMessage);
					}
				});
			}.bind(this));

			this.$bagViewToggleMobile.on("click", function() {
				this.$el.toggleClass("slide-up-down-bag-view-in-mobile");
			}.bind(this));

			if ($(classes.CART_ITEM_CONTAINER).length === 0) {
				this.hideCartLayout();
			}

			Cog.addListener("Shopify", "cartPriceUpdate", function(e) {
				var cartInfo = e.eventData.cart;
				var currencyCode = cartInfo.currencyCode;
				this.$deliveryCharges.text(cartInfo.delivery + " " + currencyCode);
				this.$cartTax.text(cartInfo.tax + " " + currencyCode);
				this.$cartTotal.text(cartInfo.total + " " + currencyCode);
			}.bind(this));

			Cog.addListener("Shopify", "shopifyAddErrorMessage", function(e) {
				this.appendErrorMessage(e.eventData);
			}.bind(this));

		},

		appendErrorMessage: function(errorMessage) {
			var errorTemplate = "";
			errorTemplate += "<div class='shopify-error'>";
			errorTemplate += "<div class='shopify-error__msg-container'>";
			errorTemplate += "<span>" + errorMessage + "</span>";
			errorTemplate += "<span class='shopify-error__close'>X</span>";
			errorTemplate += "</div>";
			errorTemplate += "</div>";
			this.closeErrorNotification();
			$(classes.BODY).append(errorTemplate);
		},

		closeErrorNotification: function() {
			$(classes.ERROR_NOTIFICATION).remove();
		},

		prepareRequest: function(operation, customParams) {
			var formData = new FormData();
			var data = {
				brand: this.brand,
				locale: this.locale,
				entity: "ecommerce",
				operation: operation
			};
			$.each(customParams, function(index, item) {
				data[index] = item;
			});
			formData.append("request", JSON.stringify(data));
			return formData;
		},

		updateCartInfo: function(response) {
			response = JSON.parse(response);
			var currencyCode = " " + response.responseData.cart.currencyCode;
			this.$cartQuantity.text(response.responseData.cart.quantity);
			this.$cartSubtotal.text(response.responseData.cart.subtotal + currencyCode);
			this.$cartTax.text(response.responseData.cart.tax + currencyCode);
			this.$cartTotal.text(response.responseData.cart.total + currencyCode);

			$(classes.BASKET_ICON).text(response.responseData.cart.quantity);

			if (response.responseData.items.length === 0) {
				this.hideCartLayout();
			}
		},

		updateCartItemInfo: function($item, itemId, response) {
			response = JSON.parse(response);
			var currencyCode = " " + response.responseData.cart.currencyCode;
			var updatedItem = _.find(response.responseData.items, function(item) {
				return item.id === itemId;
			});
			$item.find(classes.ITEM_QUANTITY).text(updatedItem.quantity);
			$item.find(classes.ITEM_SUBTOTAL).text(updatedItem.total + currencyCode);
		},

		hideCartLayout: function() {
			if (this.status.isPublish()) {
				this.$customerInformation.addClass("no-item-in-cart");
			}
		}
	};

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;
		eventsDefinition = this.external.eventsDefinition;
		breakpoints = this.external.breakpoints;
		new ShopifyBagView(scope.$scope, this.external.status);
	};

	Cog.registerComponent({
		name: "shopify-bag-view",
		api: api,
		selector: ".cartbagview",
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
				name: "utils.breakpoints",
				apiId: "breakpoints"
			},
			{
				name: "utils.status",
				apiId: "status"
			}
		]
	});
}(Cog.jQuery()));
