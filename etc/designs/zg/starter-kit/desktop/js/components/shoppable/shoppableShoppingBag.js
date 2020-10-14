(function($) {
	"use strict";

	var api = {};
	var $el;
	var $itemList;
	var $price;
	var $emptyBagInfo;
	var templates = {};
	var currency;
	var shoppableToken;
	var config;
	var analyticsDef;
	var $title;
	var retry = 0;
	var maxRetry = 19;
	var retryDelay = 250;
	var retryJQuery = 90;
	var utils;
	var ctConstants;
	var isFirstPageLoad = true;//isFirstPageLoad variable gives us a status of whether cart page is loaded or calling the same function on any other events.
	var KEYS = {
		esc: 27
	};

	function ShoppableShoppingBag(scope) {
		$el = $(scope);
		analyticsSetup();

		if (!$el.hasClass("shoppable-shoppingbag")) {
			return;
		}

		shoppableToken = getShoppableToken();
		config = getConfig();
		$itemList = $el.find(".shopping-bag-item-list");
		$price = $el.find(".shopping-bag-price");
		$emptyBagInfo = $el.find(".shopping-empty-bag-info").text(config.emptyBagInfo);
		$title = $el.find("h1:first, h2:first"); // Legacy support for h2
		templates = {
			item: doT.template($el.find(".item-template").text()),
			qtySelect: doT.template($el.find(".qty-select-template").text())
		};
		currency = $el.find(".shopping-bag-currency").text();

		bindUIEvents();
		initJQueryEvents();
		refreshCart();
	}

	function refreshCart() {
		if (shoppableToken && "Cart" in window && "g_opt_obj" in window && Cart.find_cookie && Cart.find_cookie(shoppableToken).cartId) {
			var cartId = Cart.find_cookie(shoppableToken).cartId;
			var showCart = false;

			try {
				Cart.get_cart(shoppableToken, cartId, showCart, function(error, data) {
					if (data.merchants && data.merchants.length) {
						$emptyBagInfo.hide();
						$el.removeClass("shoppingbag-empty");
					} else {
						$emptyBagInfo.show();
						// include class in the wrapper setting that is empty:
						$el.addClass("shoppingbag-empty");
					}

					buildCartItemsHTML(data);
					$price.text(formatCurrency(data.cart.subtotal) || 0);
				});
			} catch (e) {
				console.log("Cart error", e);
				setShoppingBagAsEmpty($el);
			}
		} else if (shoppableToken && retry < maxRetry) {
			// Keep trying. First load will take some time to for Cart to create the shoppableToken cookie
			retry = retry + 1;
			setTimeout(refreshCart, retryDelay);
		} else {
			setShoppingBagAsEmpty($el);
		}
	}

	function setShoppingBagAsEmpty($el) {
		$el.addClass("shoppingbag-empty");
		$title.attr("data-bag-quantity", "0");
	}

	function buildCartItemsHTML(data) {
		var merchants = data.merchants;
		var itemList = [];
		$.each(merchants, function(i, merchant) {
			var items = merchant.items;
			$.each(items, function(j, item) {
				itemList.push({
					name: item.name,
					sku: item.sku,
					upc: item.upc,
					imgSrc: item.images[0],
					merchant: merchant.name,
					size: item.size,
					price: currency + item.price,
					qty: item.qty,
					editLabel: config.editLabel,
					removeLabel: config.removeLabel,
					subtotal: currency + formatCurrency(item.subtotal),
					qtySelectHTML: getQtySelectHTML(item.qty)
				});
			});
		});
		if (isFirstPageLoad) {
			cartPageLoadEvents(itemList);
			isFirstPageLoad = false;
		}

		$itemList.html(templates.item({
			itemList: itemList
		}));

		$title.attr("data-bag-quantity", itemList.length);
	}

	function cartPageLoadEvents(itemList) {
		var eventLabel = "";
		eventLabel = itemList.map(function(elem) {
			return elem.sku;
		}).join("|");
		utils.pushComponent("Shoppable", "");
		utils.addTrackedEvent(ctConstants.cartView,eventLabel,
			ctConstants.conversion,ctConstants.lead,
			ctConstants.trackEvent);
	}

	function getQtySelectHTML(currentQty) {
		var maxQty = 12;
		var options = [];

		for (var i = 1; i <= maxQty; i++) {
			options.push({
				value: i,
				selected: i === currentQty
			});
		}

		return templates.qtySelect({options: options});
	}

	function bindUIEvents() {
		$itemList.on("click", ".item-edit", function() {
			var mode = "updateProduct";
			var $item = $(this).parents(".shoppable-item");
			var sku = $item.data("sku");
			var upc = $item.data("upc");

			Product.pop_pdp(config.idType, upc, mode, sku);
		});

		$itemList.on("click", ".item-remove", function() {
			var sku = $(this).parents(".shoppable-item").data("sku");

			Product.delete_item(sku, refreshCart);
		});

		$itemList.on("change", ".select-item-qty", function() {
			var sku = $(this).parents(".shoppable-item").data("sku");

			Product.set_item_qty(sku, $(this).val(), refreshCart);
		});

	}

	function initJQueryEvents(t) {
		// we don't know when jQuery will load so keep trying for retryJQuery seconds
		t = t || Date.now() + (retryJQuery * 1000);
		function setJQueryEvents() {
			// jQuery is available in global scope only if Shoppable is enabled.
			jQuery.Topic("ADD_TO_CART").subscribe(refreshCart);
			jQuery.Topic("REMOVE_FROM_CART").subscribe(refreshCart);
			jQuery.Topic("OPEN_CART").subscribe(function() {
				jQuery(".shoppable-checkout-close-button").focus();
				setTimeout(function() {
					jQuery(".shoppable-checkout-close-button").focus();
				},100);
			});
			jQuery("body").on("click", ".shoppable-checkout-close-button", function() {
				// cart is closed using the closeCart method
				// which doesn't publish the CLOSE_CART event
				jQuery("body").removeClass("pdp_open");
				jQuery(".shoppable-cart-open-button").focus();
			});
			jQuery(document).on("keydown", function(event) {
				if (jQuery("body").hasClass("pdp_open") && (KEYS.esc === event.keyCode)) {
					jQuery(".shoppable-checkout-close-button").trigger("click");
				}
			});
			Cog.fireEvent("shoppable", analyticsDef.OTHER.SHOPPABLE_CART_VIEW);
		}
		if (typeof jQuery !== "undefined" && jQuery.Topic) {
			setJQueryEvents();
		} else {
			if (Date.now() < t) {
				setTimeout(function() {
					initJQueryEvents(t);
				}, 1000);
			}
		}
	}

	function getShoppableToken() {
		var shoppableScript = $("#shoppable_bundle").get(0);

		if (!shoppableScript) {
			return null;
		}

		var scriptOptions = shoppableScript.attributes.options.value;
		var optionsJSON = JSON.parse("{" + scriptOptions + "}");

		return optionsJSON.token;
	}

	function getConfig() {
		return $el.find(".shopping-bag-config").data("config");
	}

	function analyticsSetup() {
		Cog.fireEvent("shoppable", analyticsDef.OTHER.SHOPPABLE_INIT);
	}

	function formatCurrency(value) {
		if (isNaN(value)) {
			return "0.00";
		}

		var returnValue = Math.round(value * 100) / 100;
		returnValue = returnValue.toString().split(".");
		if (returnValue.length === 1) {
			return returnValue[0] + ".00";
		}
		return returnValue[0] + "." + (returnValue[1] + "00").substr(0, 2);
	}

	api.init = function(scope) {

		analyticsDef = this.external.eventsDefinition;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;

		if ("ShoppableApi" in window) {
			new ShoppableShoppingBag(scope);
		} else {
			Cog.addListener("shoppable", "SHOPPABLE_LAZY_LOAD", function() {
				new ShoppableShoppingBag(scope);
			}.bind(this));
		}
	};

	Cog.register({
		name: "shoppableShoppingBag",
		api: api,
		selector: ".shoppable-shoppingbag",
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]
	});
})(Cog.jQuery());
