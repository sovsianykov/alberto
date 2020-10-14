(function($) {
	"use strict";
	var api = {};
	var ORDER_SUMMARY_ENDPOINT = "/sk-eu/services/shopify/ordersummary";
	var SPACE = " ";
	var queryString;
	var analyticsUtils;
	var eventsDefinition;
	var selector = {
		HIDE_ELEMENT: "hide-element",
		SHOPIFY_ORDER_SUMMARY: ".shopify-order-summary",
		ORDER_NUMBER: "#orderNumber",
		PRICE_PER_QUANTIY: "#pricePerQuantiy",
		QUANTITY: "#quantity",
		SUBTOTAL_CHARGES: "#subTotalCharges",
		TAX_CHARGES: "#taxCharges",
		DELIVERY_CHARGES: "#deliveryCharges",
		TOTAL_CHARGES: "#totalCharges",
		CUSTOMER_NAME: "#customerName",
		ADDRESSLINE1: "#addressLine1",
		ADDRESSLINE2: "#addressLine2",
		CITY: "#city",
		PROVINCE: "#province",
		POSTCODE: "#postCode",
		COUNTRY: "#country",
		EMAIL_ID: "#emailId",
		PHONE_NUMBER: "#phoneNumber",
		DELIVERY_METHOD: "#deliveryMethod",
		DELIVERY_METHOD_CHARGES: "#deliveryMethodCharges",
		ERROR_NOTIFICATION: ".shopify-error",
		ERROR_CLOSE: ".shopify-error__close",
		BODY: "body",
		PRODUCT_DETAILS: "#shopify-product-data",
		PERSONALISATION_LABEL: "data-personalisation-label",
		PRICE_PER_QUANTIY_LABEL: "data-price-per-quantity-label",
		QUANTITY_LABEL: "data-quantity-label",
		PRODUCT_SIZE_LABEL: "data-size-abel",
		CONTINUE_SHOPPING_BUTTON: ".shopify-continue-button",
		ORDER_SUMMARY: ".orderSummary"
	};

	function ShopifyOrderSummary($el) {
		this.$el = $el;
		this.adapterParams = $el.data("params");
		this.errorMessage = $el.data("error-message");
		this.adapterParams.orderId = queryString.getFromQueryString("order-id");
		this.productDetails = this.$el.find(selector.PRODUCT_DETAILS);

		this.componentPosition = analyticsUtils.getComponentPosition(this.$el.closest(selector.ORDER_SUMMARY));
		this.getOrderSummary();
		this.bindUIEvents();
	}

	ShopifyOrderSummary.prototype = {

		bindUIEvents:function() {
			$(document).on("click", selector.ERROR_CLOSE, function() {
				this.closeErrorNotification();
			}.bind(this));

			$(document).on("click", selector.CONTINUE_SHOPPING_BUTTON, function() {
				Cog.fireEvent("shopify.analytics", "continueShopping",{
					componentPosition: this.componentPosition
				});
			}.bind(this));
		},

		getOrderSummary:function() {
			var formData = this.prepareFormData();
			$.ajax({
				url: ORDER_SUMMARY_ENDPOINT,
				context: this,
				async: false,
				contentType: false,
				processData: false,
				method: "post",
				data: formData,
				success: function(response) {
					response = JSON.parse(response);
					this.populateHtml(response.responseData);
					$(selector.SHOPIFY_ORDER_SUMMARY).removeClass(selector.HIDE_ELEMENT);
					//Remove Customer Form Data stored in sessionStorage
					sessionStorage.removeItem("sessionFormData");
					Cog.fireEvent("shopify.analytics", "orderSummery", {
						response: response,
						componentPosition: this.componentPosition
					});
					Cog.fireEvent("shopify.analytics", "thankYouPage", {
						response: response,
						componentPosition: this.componentPosition
					});
				},
				error: function() {
					this.displayErrorMessage(this.errorMessage);
				}
			});
		},

		prepareFormData:function() {
			var formData = new FormData();
			formData.append("host", this.adapterParams.host);
			formData.append("brand", this.adapterParams.brand);
			formData.append("locale", this.adapterParams.locale);
			formData.append("entity", this.adapterParams.entity);
			formData.append("orderId", this.adapterParams.orderId);
			return formData;
		},

		populateHtml:function(responseData) {
			this.populateProductDetailHtml(responseData);
			var currencyCode = SPACE + responseData.cart.currencyCode;
			$(selector.ORDER_NUMBER).text(responseData.name);
			$(selector.SUBTOTAL_CHARGES).text(responseData.cart.subtotal + currencyCode);
			$(selector.TAX_CHARGES).text(responseData.cart.tax + currencyCode);
			$(selector.DELIVERY_CHARGES).text(responseData.cart.deliveryAmount + currencyCode);
			$(selector.TOTAL_CHARGES).text(responseData.cart.totalAmount + currencyCode);
			$(selector.CUSTOMER_NAME).text(responseData.shippingAddress.firstName + SPACE + responseData.shippingAddress.lastName);
			$(selector.ADDRESSLINE1).text(responseData.shippingAddress.address1);
			$(selector.ADDRESSLINE2).text(responseData.shippingAddress.address2);
			$(selector.CITY).text(responseData.shippingAddress.city);
			$(selector.PROVINCE).text(responseData.shippingAddress.province);
			$(selector.POSTCODE).text(responseData.shippingAddress.zip);
			$(selector.COUNTRY).text(responseData.shippingAddress.country);
			$(selector.EMAIL_ID).text(responseData.email);
			$(selector.PHONE_NUMBER).text(responseData.contact.phoneNumber[0].value);
			$(selector.DELIVERY_METHOD).text(responseData.shippingLine[0].title);
			$(selector.DELIVERY_METHOD_CHARGES).text(responseData.shippingLine[0].price + currencyCode);
		},

		populateProductDetailHtml:function(responseData) {
			var currencyCode = SPACE + responseData.cart.currencyCode;
			var shopifyProductHtml = "";
			var personalisationLabel = $(selector.PRODUCT_DETAILS).attr(selector.PERSONALISATION_LABEL);
			var pricePerQuantityLabel = $(selector.PRODUCT_DETAILS).attr(selector.PRICE_PER_QUANTIY_LABEL);
			var quantityLabel = $(selector.PRODUCT_DETAILS).attr(selector.QUANTITY_LABEL);
			var sizeLabel = $(selector.PRODUCT_DETAILS).attr(selector.PRODUCT_SIZE_LABEL);
			for (var count = 0; count < responseData.items.length; count++) {
				shopifyProductHtml = shopifyProductHtml + "<div class='shopify-product-details'> <div class='shopify-order-summary__image-container'> <img class='shopify-order-summary__image-container--image' src='" + responseData.items[count].image.src + "' alt='" + responseData.items[count].image.alt + "'/> </div> <div class='shopify-order-summary__order-descrption-wrap'> <p class='shopify-order-summary__order-descrption-wrap__description shopify-order-summary__order-descrption-wrap__product-name margin-zero'>" + responseData.items[count].name + "</p> <p class='shopify-order-summary__order-descrption-wrap__description margin-zero'> <span>" + sizeLabel + "</span> <span>" + responseData.items[count].size + "</span> </p>";
				var personalisationText = responseData.items[count].personalisationText;
				if (personalisationText) {
					shopifyProductHtml = shopifyProductHtml + "<p class='shopify-order-summary__order-descrption-wrap__description margin-zero'><span>" + personalisationLabel + "</span><span>" + personalisationText + "</span> </p>";
				}
				shopifyProductHtml = shopifyProductHtml + "<p class='shopify-order-summary__order-descrption-wrap__description margin-zero'> <span>" + pricePerQuantityLabel + "</span> <span>" + responseData.items[count].pricePerUnit + currencyCode + "</span> </p> <p class='shopify-order-summary__order-descrption-wrap__description margin-zero'> <span>" + quantityLabel + "</span> <span>" + responseData.items[count].quantity + "</span></p></div></div>";
			}
			this.productDetails[0].innerHTML = shopifyProductHtml;
		},

		displayErrorMessage: function(errorMessage) {
			var errorTemplate = "";
			errorTemplate += "<div class='shopify-error'>";
			errorTemplate += "<div class='shopify-error__msg-container'>";
			errorTemplate += "<span>" + errorMessage + "</span>";
			errorTemplate += "<span class='shopify-error__close'>X</span>";
			errorTemplate += "</div>";
			errorTemplate += "</div>";
			this.closeErrorNotification();
			$(selector.BODY).append(errorTemplate);
		},

		closeErrorNotification: function() {
			$(selector.ERROR_NOTIFICATION).remove();
		}
	};
	api.onRegister = function(scope) {
		queryString = this.external.querystring;
		analyticsUtils = this.external.utils;
		eventsDefinition = this.external.eventsDefinition;
		new ShopifyOrderSummary(scope.$scope);
	};

	Cog.registerComponent({
		name: "shopify-order-summary",
		api: api,
		selector: selector.SHOPIFY_ORDER_SUMMARY,
		requires: [{
			name: "utils.querystring",
			apiId: "querystring"
		}, {
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		}, {
			name: "analytics.utils",
			apiId: "utils"
		}]
	});
})(Cog.jQuery());
