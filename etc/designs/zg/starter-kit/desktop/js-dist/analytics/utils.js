(function($) {
	"use strict";

	var api = {};
	var sharedApi = {};
	var ctConstants;
	var events;
	var CLASSES = {
		backToTop: "back-to-top"
	};

	api.init = function() {
		ctConstants = this.external.eventsDefinition.ctConstants;
		events = this.external.eventsDefinition.CLICK;
	};

	sharedApi.isAnalyticsConfigured = function() {
		return typeof isDigitalDataActive !== "undefined" && isDigitalDataActive && typeof digitalData !== "undefined";
	};

	sharedApi.pushComponent = function(name, position, category, subcategory, attributes) {	//jshint ignore:line
		digitalData.component = [];
		digitalData.component.push({
			componentInfo: {
				componentID: name,
				componentName: name
			},
			category: {primaryCategory: category || ctConstants.engagement},
			subcategory: subcategory || ctConstants.read,
			attributes: attributes || {
				position: position,
				componentPosition: position,
				campaignWorkFlow: "",
				componentVariant: "defaultView",
				promoCreative:"",
				promoID: "",
				promoName: "",
				promoPosition: "",
				reviewVendorName: "",
				toolName: "",
				timestamp: new Date()
			}
		});
	};

	sharedApi.addTrackedEvent = function(action, label, category, subcategory, attributesObject, type) {	//jshint ignore:line
		var ev = {};

		ev.eventInfo = {
			type: type || ctConstants.trackEvent,
			eventAction: action,
			eventLabel: label,
			eventValue: 1
		};
		ev.category = {primaryCategory: category || ctConstants.engagement};
		ev.subcategory = subcategory || ctConstants.read;
		ev.attributes = attributesObject || {};

		if (typeof PubSub !== "undefined") {
			PubSub.publish("UDM", ev);
		}
	};

	sharedApi.createProduct = function(productData) {
		productData = productData || {};
		return {
			productInfo:{
				productID: productData.EAN || "",
				productName: productData.shortTitle || "",
				price: 0,
				brand: digitalData.siteInfo.localbrand,
				quantity: 0,
				sku: productData.sku || ""
			},
			category:{
				primaryCategory: productData.category || ""
			},
			price:{
				voucherCode: "voucher code"
			},
			attributes: {
				productPosition: 0,
				productVariants: productData.sizes || "",
				listPosition: 0,
				pcatName: "",
				productRetailer: "",
				integration: "",
				productBrand: digitalData.siteInfo.localbrand,
				productAward: "",
				productFindingMethod: "",
				country: ""
			}
		};
	};

	sharedApi.pushProduct = function(product) {
		digitalData.product.push(product);
	};

	sharedApi.pushCart = function(products) {
		digitalData.cart.item = products;
	};

	sharedApi.getComponentPosition = function($component) {
		return $component.data("position") || "";
	};

	sharedApi.setSearchData = function(keyword, resultNumber) {
		digitalData.page.pageInfo.onsiteSearchTerm = keyword;
		digitalData.page.pageInfo.onSiteSearch = resultNumber || "";
	};

	sharedApi.determineLinkTitle = function($target) {
		return $target.attr("title") ||
				$target.text() ||
				$target.parent().attr("title") || //case for carousel links
				"";
	};

	sharedApi.isExternalLink = function(href, treatAsLinkClick) {
		href = href.toLowerCase();
		return _.startsWith(href, "http") && !_.includes(href, window.location.hostname.toLowerCase()) && !treatAsLinkClick;
	};

	sharedApi.resolveListingProductEan = function($element) {
		return $element.closest(".listing-item").data("item-primarykey").split("/").pop();
	};

	sharedApi.resolveSearchProductEan = function($element) {
		return $element.closest(".searchResults-item").data("ean") || $element.data("ean");
	};

	sharedApi.fetchVisibleListingItems = function($listing) {
		var products = $listing.find(".listing-item").filter(":visible");
		var listingLimit = $listing.find(".show-more").data("limit");
		if (listingLimit !== undefined && products.length > listingLimit) {
			return products.slice(0, listingLimit);
		}
		return products;
	};

	function getLabel(data, $target) {
		return data.label || sharedApi.determineLinkTitle($target);
	}

	sharedApi.trackLinks = function($links, data) {
		$links.on("click", function(e) {
			var $target = $(e.target);
			data = data || {};
			data.type = data.type || "";
			data.componentName = data.componentName || "";
			data.componentPosition = data.componentPosition || "";
			data.href = sharedApi.getHref($target, data);
			data.label = getLabel(data, $target);

			if (data.type === ctConstants.product) {
				if (data.componentName === ctConstants.listing) {
					data.ean = sharedApi.resolveListingProductEan($target);
				} else if (data.componentName === ctConstants.searchResults) {
					data.ean = sharedApi.resolveSearchProductEan($target);
				}
			}

			sharedApi.fireLinkTagAnalytics($target.hasClass(CLASSES.backToTop), data);
		});
	};

	sharedApi.fireLinkTagAnalytics = function(isItbackToTopLink, data) {
		if (!isItbackToTopLink) {
			Cog.fireEvent("link", events.LINK_CLICK, data);
		}
	};

	sharedApi.isElementInView = function(elem) {
		if ($(elem).length > 0) {
			var topOfElement = $(elem).offset().top;
			var bottomOfElement = $(elem).offset().top + $(elem).outerHeight();
			var bottomOfScreen = $(window).scrollTop() + window.innerHeight;
			var topOfScreen = $(window).scrollTop();
			var flag = false;
			if ((bottomOfScreen > topOfElement) && (topOfScreen < bottomOfElement)) {
				flag = true;
			}
			return flag;
		}
	};

	sharedApi.getEanFromSmartProductId = function(smartProductIdConfigured) {
		var ean;
		for (var key in allProducts) {
			if (allProducts.hasOwnProperty(key)) {
				var smartProductIdFromJson = allProducts[key].smartProductID;
				if (smartProductIdConfigured === smartProductIdFromJson) {
					ean = key;
					break;
				}
			}
		}
		return ean;
	};

	sharedApi.getHref = function($target, data) {
		return data.href || $target.attr("href") || $target.parent().attr("href") || $target.parent().parent().attr("href");
	};

	Cog.registerStatic({
		name: "analytics.utils",
		sharedApi: sharedApi,
		api: api,
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			}]
	});
})(Cog.jQuery());
