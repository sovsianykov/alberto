(function($, cssua) {
	"use strict";

	var api = {};
	var eventsDefinition = {};
	var analyticsUtils = {};
	var ops = {
		isAndroid: (cssua && cssua.ua && cssua.ua.android),
		maxLength: null
	};
	var breakpoints;
	var maxlength;
	var CART_ENDPOINT = "/sk-eu/services/shopify/cart";
	var classes = {
		IMAGE_ANCESTOR: ".listing-item", // used in inline form
		PERSONALISATION_ENABLED: "personalisation-text-enabled",
		BIN_BTN: ".js-shopify-open-modal",
		BIN_NORMAL_BUTTON: ".shopify__add-to-cart-btn",
		BRAND_INPUT: "input[name=brand]",
		EAN_INPUT: "input[name=ean]",
		PRODUCTUNAVAILABLETEXT_INPUT: "input[name=productUnavailableText]",
		CARTPAGE_INPUT: "input[name=cartPage]",
		FORM: ".form",
		IMAGE_PARENT: ".shopify__image", // used in popup form
		LOCALE_INPUT: "input[name=locale]",
		MODAL_CONTROL: ".js-modal-toggle-state",
		PERSONALISATION_INPUT: "input[name=personalisedText]",
		QUANTITY_SELECT: "select[name=quantity]",
		VARIANT_ID: "input[name=variantId]",
		BUY_IT_NOW: ".buyitnow"
	};
	var isIntentLoaded;

	function Shopify($el) {
		this.$el = $el;
		this.$btnBuyItNow = $el.find(classes.BIN_BTN);
		this.$btnNormalButton = $el.find(classes.BIN_NORMAL_BUTTON);
		this.$form = $el.find(classes.FORM);
		this.$personalisedInput = this.$form.find(classes.PERSONALISATION_INPUT);
		this.$quantitySelect = this.$form.find(classes.QUANTITY_SELECT);
		this.$eanInput = this.$form.find(classes.EAN_INPUT);
		this.$variantId = this.$form.find(classes.VARIANT_ID);
		this.$imageParent = this.$el.find(classes.IMAGE_PARENT);
		this.$cartPage = this.$el.find(classes.CARTPAGE_INPUT);
		this.$productUnavailableText = this.$el.find(classes.PRODUCTUNAVAILABLETEXT_INPUT);
		this.$modalControl = this.$el.find(classes.MODAL_CONTROL).first();
		this.personalisationText = "";
		this.brand = $el.find(classes.BRAND_INPUT).val();
		this.locale = $el.find(classes.LOCALE_INPUT).val();
		this.isInline = !this.$modalControl.length;
		this.$imageAncestor = this.$el.closest(classes.IMAGE_ANCESTOR);
		this.componentPosition = analyticsUtils.getComponentPosition(this.$el.closest(classes.BUY_IT_NOW));
		Cog.addListener("shopify", "personalisationText.change", this.onPersonalisationTextChange.bind(this));

		this.bindUIEvents();
		this.initPage();
		this.loadBinWidgetIfIntentIsPurchase();
	}

	Shopify.prototype = {
		onPersonalisationTextChange: function(e) {
			var data = e.eventData;
			data.personalisationText = data.personalisationText || "";
			if (data.personalisationText !== this.personalisationText) {
				this.personalisationText = data.personalisationText;
				this.$personalisedInput.val(data.personalisationText);
			}
			this.$imageParent
				.attr("data-personalisation-text", data.personalisationText)
				.attr("data-personalisation-length", data.personalisationText.length)
				.attr("data-personalisation-ean", data.ean);
		},
		initPage: function() {
			// Personal text is hidden by default and shown if the product is personalisable
			if (this.$personalisedInput.length) {// it's a personalisable product
				if (this.$imageAncestor.length) {
					this.$imageAncestor.addClass(classes.PERSONALISATION_ENABLED);
				}
				if (this.$imageParent.length) {
					this.$imageParent.addClass(classes.PERSONALISATION_ENABLED);
				}
				Cog.fireEvent("shopify", "personalisationText.change", {
					personalisationText: this.$personalisedInput.val(),
					ean: this.$eanInput.val(),
					isInline: this.isInline,
					integration: "Shopify"
				});
			}
		},
		bindUIEvents: function() {
			this.$btnBuyItNow.on("click click:quickview", function() {
				this.$modalControl.trigger("click");
				Cog.fireEvent("buyitnow", eventsDefinition.CLICK.BIN_CLICK, {
					componentPosition: analyticsUtils.getComponentPosition(
						this.$btnBuyItNow),
					product: this.$btnBuyItNow.attr("data-ean"),
					component: "Shopify"
				});
			}.bind(this));

			this.$btnNormalButton.on("click", function() {
				Cog.fireEvent("shopify.analytics", "addToCart", {
					componentPosition: this.componentPosition,
					productEan: this.$btnNormalButton.attr("data-ean"),
					component: "Shopify",
					quantity: this.$quantitySelect.val()
				});
			}.bind(this));

			this.$form.on("submit", function(event) {
				event.preventDefault();
				var formData = this.fetchFormData();
				var successUrl = this.$cartPage.val();
				var $modalControl = this.$modalControl;
				var errorMessage = this.$productUnavailableText.val();
				var errorFunction = function() {
					window.alert(errorMessage);
					$modalControl.trigger("click");
				};
				$.ajax({
					url: CART_ENDPOINT,
					contentType: false,
					processData: false,
					dataType: "json",
					method: "post",
					data: formData,
					success: function(data) {
						if (data && data.errors && data.errors.length) {
							errorFunction();
							return;
						}
						location.href = successUrl + ".html";
					},
					error: errorFunction
				});
			}.bind(this));

			this.$personalisedInput.on("keyup blur focus change", function() {
				this.fixAndroidMaxLength();
				var personalisationText = this.$personalisedInput.val();
				if (this.personalisationText === personalisationText) { // nothing changed ignore event
					return;
				}
				this.personalisationText = personalisationText;
				// we don't know what components might need to know this
				// so firing an event that any component can listen for.
				// adding personalisation text and ean so the message can be
				// styled differently for different products if needed
				Cog.fireEvent("shopify", "personalisationText.change", {
					personalisationText: this.personalisationText,
					ean: this.$eanInput.val(),
					isInline: this.isInline
				});

			}.bind(this));

			if (this.isInline) {
				// if model see model.js
				maxlength.showRemainingCount({
					$root: this.$el
				});
			}
		},
		fetchFormData: function() {
			var formData = new FormData();
			var data = {
				brand: this.brand,
				locale: this.locale,
				entity: "ecommerce",
				operation: "add",
				productId: this.$variantId.val(),
				quantity: parseInt(this.$quantitySelect.val(), 10),
				attributes: {
					personalisationText: this.$personalisedInput.val()
				}
			};
			formData.append("request", JSON.stringify(data));
			return formData;
		},
		fixAndroidMaxLength: function() {
			if (!ops.isAndroid) {
				// some versions of android don't support maxlength attribute <input type="text" maxlength="11" ... />
				return;
			}
			if (!ops.maxLength) {
				// read maxlength value from HTML once
				ops.maxLength = + this.$personalisedInput.attr("maxlength");
			}
			var personalisationText = this.$personalisedInput.val();
			if (personalisationText.length > ops.maxLength) {
				this.$personalisedInput.val(personalisationText.substring(0, ops.maxLength));
			}
		},
		loadBinWidgetIfIntentIsPurchase: function() {
			if (!isIntentLoaded) {
				setTimeout(function() {
					Cog.fireEvent("buyitnow", eventsDefinition.LOAD.PDP_PAGE_LOAD, {
						element: this.$modalControl,
						integration: "Shopify"
					});
					isIntentLoaded = true;
				}.bind(this), 2000);
			}
		}
	};

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;
		eventsDefinition = this.external.eventsDefinition;
		breakpoints = this.external.breakpoints;
		maxlength = this.external.maxlength;
		new Shopify(scope.$scope);
	};

	Cog.registerComponent({
		name: "shopify-bin",
		api: api,
		selector: ".shopify",
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
				name: "utils.maxlength",
				apiId: "maxlength"
			}
		]
	});
}(Cog.jQuery(), window.cssua));
