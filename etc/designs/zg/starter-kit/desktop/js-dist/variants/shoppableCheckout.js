(function($) {
	"use strict";

	// Iframe URL needs to be set using Shoppable API which is loaded asynchronously.
	// This script ensures that Shoppable Checkout iframe URL is set after the main Shoppable API has been loaded.
	// This is achieved by waiting for the main API to load for one second.

	var api = {};
	var $iframe;
	var retryCounter = 0;
	var maxRetries = 20;

	function ShoppableCheckoutPage(scope) {
		var $el = $(scope);

		if (!$el.hasClass("html--shoppable-checkout") || !Cart) {
			return;
		}

		$iframe = $el.find("iframe");
		attachRedirectEvent();
		initializeIframeWithCheckoutUrl();
	}

	function initializeIframeWithCheckoutUrl() {
		var interval = 250;

		retryCounter += 1;

		try {
			var url = Cart.get_checkout_url();

			if (typeof url === "string") {
				$iframe.attr("src", url);
			}
		} catch (e) {
			if (e && retryCounter < maxRetries) {
				setTimeout(function() {
					initializeIframeWithCheckoutUrl();
				}, interval);
			}
		}
	}

	function attachRedirectEvent() {
		window.addEventListener("message", function(event) {
			var data;

			if (isShoppableRedirectEvent(event.data)) {
				data = extractJSONfromEventData(event.data);

				if (data.luxtype && data.luxtype === "redirect") {
					window.location.replace(data.url);
				}
			}
		});
	}

	function isShoppableRedirectEvent(eventData) {
		return typeof eventData === "string" && eventData.indexOf("LUX_DATA") === 0;
	}

	function extractJSONfromEventData(eventData) {
		return JSON.parse(eventData.replace("LUX_DATA:", ""));
	}
	api.init = function(scope) {

		if ("ShoppableApi" in window) {
			new ShoppableCheckoutPage(scope);
		} else {
			Cog.addListener("shoppable", "SHOPPABLE_LAZY_LOAD", function() {
				new ShoppableCheckoutPage(scope);
			}.bind(this));
		}
	};
	Cog.register({
		name: "shoppableCheckout",
		api: api,
		selector: ".html--shoppable-checkout"
	});
})(Cog.jQuery());
