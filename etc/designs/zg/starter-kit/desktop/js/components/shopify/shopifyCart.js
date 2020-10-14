(function($) {
	"use strict";

	var api = {};
	var eventsDefinition = {};
	var analyticsUtils = {};
	var breakpoints;
	var CART_ENDPOINT = "/sk-eu/services/shopify/cart";
	var classes = {
		BRAND_INPUT: "input[name=brand]",
		CART_ITEM_CONTAINER: ".cart-item",
		CART_NOTE: "textarea.cart-note",
		CART_QUANTITY: "span.cart-quantity",
		CART_SUBTOTAL: "span.cart-subtotal",
		CART_TAX: "span.cart-tax",
		CART_TOTAL: "span.cart-total",
		CHECKOUT_BUTTON: "a.checkout",
		ITEM_QUANTITY: "span.item-quantity",
		ITEM_SUBTOTAL: "span.item-subtotal",
		LOCALE_INPUT: "input[name=locale]",
		QUANTITY_SELECT: "select[name=quantity]",
		REMOVE_FROM_CART: "a.cart-remove",
		TERMS_CHECKBOX: "input[name=terms]",
		TERMS_ERROR_MESSAGE: "span#terms-error-message",
		BASKET_ICON: ".shopify-basket__quantity",
		CART_HIDDEN: "shopify-cart-view__shopify-cart__hidden",
		SHOPIFY_CART: ".shopify-cart-view__shopify-cart",
		CONTINUE_SHOPPING_BUTTON: ".shopify-continue-button",
		CART_VIEW: ".cartview"
	};

	function ShopifyCart($el) {
		this.$el = $el;
		this.$cartQuantity = $el.find(classes.CART_QUANTITY);
		this.$cartSubtotal = $el.find(classes.CART_SUBTOTAL);
		this.$cartTax = $el.find(classes.CART_TAX);
		this.$cartTotal = $el.find(classes.CART_TOTAL);
		this.brand = $el.find(classes.BRAND_INPUT).val();
		this.locale = $el.find(classes.LOCALE_INPUT).val();
		this.$removeFromCartButtons = $el.find(classes.REMOVE_FROM_CART);
		this.$quantitySelects = $el.find(classes.QUANTITY_SELECT);
		this.$cartNote = $el.find(classes.CART_NOTE);
		this.$checkoutButton = $el.find(classes.CHECKOUT_BUTTON);
		this.$termsCheckbox = $el.find(classes.TERMS_CHECKBOX);
		this.$termsErrorMessage = $el.find(classes.TERMS_ERROR_MESSAGE);
		this.$cartBody = $el.find(classes.SHOPIFY_CART);

		this.errorMessage = $el.data("errormessage");
		this.checkoutTarget = this.$checkoutButton.attr("href");
		this.componentPosition = analyticsUtils.getComponentPosition(this.$el.closest(classes.CART_VIEW));

		this.setCheckoutEnabled(false);
		this.bindUIEvents();
	}

	ShopifyCart.prototype = {

		bindUIEvents: function() {
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

			$(document).on("click", classes.CONTINUE_SHOPPING_BUTTON, function() {
				Cog.fireEvent("shopify.analytics", "continueShopping", {
					componentPosition: this.componentPosition
				});
			}.bind(this));

			$(document).on("click", classes.CHECKOUT_BUTTON, function() {
				var checkoutUrl = event.target.hasAttribute("href");
				if (checkoutUrl) {
					Cog.fireEvent("shopify.analytics", "checkoutPage", {
						componentPosition: this.componentPosition
					});
				}
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

			this.$cartNote.on("change", function(event) {
				var $target = $(event.target);
				var formData = this.prepareRequest("set-note",{
					noteText: $target.val()
				});
				this.$checkoutButton.hide();
				$.ajax({
					url: CART_ENDPOINT,
					context: this,
					contentType: false,
					processData: false,
					method: "post",
					data: formData
				});
				this.$checkoutButton.show();

			}.bind(this));

			this.$termsCheckbox.on("change", function(event) {
				var $target = $(event.target);
				this.setCheckoutEnabled($target.is(":checked"));
			}.bind(this));

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
			if (response.responseData.cart.quantity === 0) {
				this.$cartBody.addClass(classes.CART_HIDDEN);
				location.reload();
			} else {
				var currencyCode = " " + response.responseData.cart.currencyCode;
				this.$cartQuantity.text(response.responseData.cart.quantity);
				this.$cartSubtotal.text(response.responseData.cart.subtotal + currencyCode);
				this.$cartTax.text(response.responseData.cart.tax + currencyCode);
				this.$cartTotal.text(response.responseData.cart.total + currencyCode);
			}
			$(classes.BASKET_ICON).text(response.responseData.cart.quantity);
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

		setCheckoutEnabled: function(enabled) {
			if (enabled) {
				this.$checkoutButton.attr("href", this.checkoutTarget);
				this.$checkoutButton.off("click");
				this.$termsErrorMessage.removeClass("visible");

			} else {
				this.$checkoutButton.removeAttr("href");
				this.$checkoutButton.on("click", function() {
					this.$termsErrorMessage.addClass("visible");
				}.bind(this));
			}
		}
	};

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;
		eventsDefinition = this.external.eventsDefinition;
		breakpoints = this.external.breakpoints;
		new ShopifyCart(scope.$scope);
	};

	Cog.registerComponent({
		name: "shopify-cart",
		api: api,
		selector: ".shopify-cart-view",
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
			}
		]
	});
}(Cog.jQuery()));
