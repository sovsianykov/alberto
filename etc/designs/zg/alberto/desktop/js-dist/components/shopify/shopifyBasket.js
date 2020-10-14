(function($) {
	"use strict";

	var api = {};
	var analyticsUtils;
	var eventsDefinition;
	var CART_ENDPOINT = "/sk-eu/services/shopify/cart";
	var classes = {
		BASKET_ICON: ".shopify-basket__quantity",
		HIDDEN: "hidden",
		CART_VIEW: ".cartview",
		BASKET: ".basketicon"
	};

	function ShopifyBasket($el) {
		this.$el = $el;
		this.$quantity = $el.find(classes.BASKET_ICON);
		this.config = this.$quantity.data("config");
		this.componentPosition = analyticsUtils.getComponentPosition(this.$el.closest(classes.BASKET));
		if (this.config) {
			this.fetchCartQuantity();
		} else {
			console.error("Could not parse config for basket");
		}
		this.bindUIEvents();
	}

	ShopifyBasket.prototype = {
		bindUIEvents: function() {
			this.$el.on("click", function() {
				Cog.fireEvent("shopify.analytics", "miniBagClick", {
					componentPosition: this.componentPosition
				});
			});
		},
		fetchCartQuantity: function() {
			var formData = this.prepareRequest();
			$.ajax({
				url: CART_ENDPOINT,
				context: this,
				async: false,
				contentType: false,
				processData: false,
				method: "post",
				data: formData,
				success: function(response) {
					response = JSON.parse(response);
					if (response.status === "Success") {
						this.updateCartQuantity(response.responseData.cart.quantity);
						Cog.fireEvent("shopify.analytics", "saveCartState", response.responseData.items);
						if ($(classes.CART_VIEW).length > 0) {
							var componentPosition = analyticsUtils.getComponentPosition($(classes.CART_VIEW));
							Cog.fireEvent("shopify.analytics", "cartPageLoad", {
								response: response,
								componentPosition: componentPosition
							});
						}
					} else {
						this.updateCartQuantity(0);
					}
				}.bind(this),
				error: function() {
					console.error("Could not fetch quantity for basket");
					this.updateCartQuantity(0);
				}
			});
		},

		updateCartQuantity: function(quantity) {
			this.$quantity.text(quantity);
			this.$el.removeClass(classes.HIDDEN);
		},

		prepareRequest: function() {
			var formData = new FormData();
			var data = {
				brand: this.config.brand,
				locale: this.config.locale,
				entity: this.config.entity,
				cartAction: "getCart"
			};
			formData.append("request", JSON.stringify(data));
			return formData;
		}
	};

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;
		eventsDefinition = this.external.eventsDefinition;
		new ShopifyBasket(scope.$scope);
	};

	Cog.registerComponent({
		name: "shopify-basket",
		api: api,
		selector: ".shopify-basket",
		requires: [{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]
	});

}(Cog.jQuery()));
