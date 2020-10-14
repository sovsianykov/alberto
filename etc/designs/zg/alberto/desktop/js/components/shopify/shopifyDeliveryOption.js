(function($) {
	"use strict";
	var api = {};
	var SHIPPING_ENDPOINT = "/sk-eu/services/shopify/shipping";
	var selector = {
		UPDATE_DELIVERY_METHOD_BUTTON: "a#update-delivery-method",
		DELIVERY_METHOD_RADIO: "input[name=delivery-method]",
		DELIVERY_METHOD_RADIO_CHECKED: "input[name=delivery-method]:checked"
	};

	function ShopifyDeliveryOption($el) {
		this.$el = $el;
		this.$updateDeliveryMethodButton = $el.find(selector.UPDATE_DELIVERY_METHOD_BUTTON);
		this.$deliveryMethodRadio = $el.find(selector.DELIVERY_METHOD_RADIO);
		this.adapterParams = $el.find(".delivery-method").data("params");
		this.errorMessage = $el.find(".delivery-method").data("errormessage");
		this.bindUIEvents();
	}

	ShopifyDeliveryOption.prototype = {

		enableDisableUpdateButton: function(value) {
			if (value === "enable") {
				this.$updateDeliveryMethodButton.removeClass("disable-continue-cart-button");
			} else {
				this.$updateDeliveryMethodButton.addClass("disable-continue-cart-button");
			}
		},

		bindUIEvents: function() {
			this.$updateDeliveryMethodButton.on("click", function(event) {
				event.preventDefault();
				this.enableDisableUpdateButton("disable");
				var redirectUrl = this.$updateDeliveryMethodButton.attr("data-redirect-url");
				if (redirectUrl) {
					window.location.href = redirectUrl;
				} else {
					var selectedShippingMethod = $(selector.DELIVERY_METHOD_RADIO_CHECKED).val();
					this.adapterParams.shippingRateHandle = selectedShippingMethod;
					var formData = new FormData();
					formData.append("params", JSON.stringify(this.adapterParams));
					$.ajax({
						url: SHIPPING_ENDPOINT,
						context: this,
						async: false,
						contentType: false,
						processData: false,
						method: "post",
						data: formData,
						success: function(response) {
							response = JSON.parse(response);
							window.location.href = response.responseData.cart.checkoutUrl;
						},
						error: function() {
							this.enableDisableUpdateButton("enable");
							Cog.fireEvent("Shopify", "shopifyAddErrorMessage", this.errorMessage);
						}
					});
				}
			}.bind(this));

			this.$deliveryMethodRadio.on("change", function() {
				this.deliveryMethodChange();
			}.bind(this));

			this.deliveryMethodChange();
		},

		deliveryMethodChange: function() {
			this.enableDisableUpdateButton("disable");
			var selectedShippingMethod = $(selector.DELIVERY_METHOD_RADIO_CHECKED).val();
			this.adapterParams.shippingRateHandle = selectedShippingMethod;
			var formData = new FormData();
			formData.append("params", JSON.stringify(this.adapterParams));
			$.ajax({
				url: SHIPPING_ENDPOINT,
				context: this,
				contentType: false,
				processData: false,
				method: "post",
				data: formData,
				success: function(response) {
					response = JSON.parse(response);
					this.$updateDeliveryMethodButton.attr("data-redirect-url", response.responseData.cart.checkoutUrl);
					this.enableDisableUpdateButton("enable");
					Cog.fireEvent("Shopify", "cartPriceUpdate", response.responseData);
				},
				error: function() {
					this.enableDisableUpdateButton("enable");
					this.$updateDeliveryMethodButton.removeClass("disable-continue-cart-button");
					Cog.fireEvent("Shopify", "shopifyAddErrorMessage", this.errorMessage);
				}
			});
		}
	};
	api.onRegister = function(scope) {
		new ShopifyDeliveryOption(scope.$scope);
	};

	Cog.registerComponent({
		name: "shopify-delivery-option",
		api: api,
		selector: ".shopify-delivery-option",
		requires: [{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		}, {
			name: "analytics.utils",
			apiId: "utils"
		}, {
			name: "utils.breakpoints",
			apiId: "breakpoints"
		}]
	});
})(Cog.jQuery());
