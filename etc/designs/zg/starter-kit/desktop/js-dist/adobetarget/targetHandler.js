/**
 * Adobe Target - util methods
 */

(function($) {
	"use strict";
	var api = {};
	var sharedApi = {};
	var urlUtil;
	var runmodeUtil;

	var RECOMMENDATIONS_HOST = "https://unilever.tt.omtrdc.net/m2/unilever/ubox/raw";

	var DEFAULT_MBOX = "adobe-templated-mbox";

	var SELECTORS = {
		CONTENT_SNIPPET: ".contentSnippet",
		PRODUCT_SECTION: ".composite-variation-product-carousel",
		ARTICLE_SECTION: ".composite-variation-related_articles",
		QUICKVIEW_ITEM: ".productQuickView",
		LISTING_ITEM: ".listing",
		LISTING_ITEMS: ".listing .listing-items",
		FETCHING_TARGET_DATA: "adobe-products-loading"
	};

	var ATTRIBUTES = {
		ID: "id"
	};

	sharedApi.safeCreateMbox = function(params) {
		if (sharedApi.isTargetEnabled()) {
			sharedApi.createMbox(params);
		} else {
			console.log("Target is disabled for this domain");
		}
	};

	sharedApi.createMbox = function(params) {
		var mboxArgs = [];
		params.mboxName = params.mboxName || DEFAULT_MBOX;

		mboxArgs.push(params.elementId);
		mboxArgs.push(params.mboxName);
		for (var prop in params.properties) {
			if (params.properties.hasOwnProperty(prop)) {
				mboxArgs.push(prop + "=" + params.properties[prop]);
			}
		}
		mboxDefine.apply(window, mboxArgs);
		mboxUpdate(params.mboxName);
	};

	sharedApi.isTargetEnabled = function() {
		return typeof mboxDefine !== "undefined" && typeof mboxUpdate !== "undefined";
	};

	sharedApi.getRecommendations = function(onSuccess, onError) {
		if (sharedApi.isTargetEnabled()) {
			$.ajax({
				url: api.getRecommendationsUrl(),
				success: onSuccess,
				error: onError
			});
		}
	};

	sharedApi.getRecommendationsReady = function(arrayValues, snippetPath, type) {
		var selectedSection;
		type = type.toLowerCase();
		if (type === "products") {
			selectedSection = $(SELECTORS.PRODUCT_SECTION);
		} else if (type === "articles") {
			selectedSection = $(SELECTORS.ARTICLE_SECTION);
		}
		selectedSection.find(SELECTORS.LISTING_ITEMS).addClass(SELECTORS.FETCHING_TARGET_DATA).append("<div class='data-loading'></div>");

		if (arrayValues) {
			var idArray = [];
			$.each(arrayValues, function() {
				var id = $(this).attr(ATTRIBUTES.ID);
				if (id.trim()) {
					idArray.push(id);
					snippetPath += "." + id;
				}
			});
			if (idArray.length > 1) {
				snippetPath += ".html";

				if (runmodeUtil.isAuthor()) {
					snippetPath += "?wcmmode=disabled";
				}
				ajaxCall(snippetPath, selectedSection);
			}
		}
	};

	function ajaxCall(snippetPath, selectedSection) {
		$.ajax({
			url: snippetPath,
			type: "GET",
			success: function(response) {
				var result = $(response).find(SELECTORS.CONTENT_SNIPPET).html();
				selectedSection.replaceWith(result);
				var quickviewcontainer = $(SELECTORS.QUICKVIEW_ITEM);
				var listingcontainer = $(SELECTORS.LISTING_ITEM);
				Cog.init({
					$element: quickviewcontainer
				});
				Cog.init({
					$element: listingcontainer
				});
			},
			timeout: 3000,
			error: function() {
				console.log("Could not fetch reponse");
			},
			complete: function() {
				selectedSection.find(SELECTORS.LISTING_ITEMS).removeClass(SELECTORS.FETCHING_TARGET_DATA);
			}
		});
	}

	api.getRecommendationsUrl = function(mbox) {
		mbox = mbox || DEFAULT_MBOX;
		var url = RECOMMENDATIONS_HOST;

		url = urlUtil.addOrUpdateQueryParam(url, "mbox", mbox);
		url = urlUtil.addOrUpdateQueryParam(url, "mboxContentType", "application/json");
		url = urlUtil.addOrUpdateQueryParam(url, "at_property", window.atProperty);
		url = urlUtil.addOrUpdateQueryParam(url, "mboxNoRedirect", true);
		url = urlUtil.addOrUpdateQueryParam(url, "mboxSession", api.getMboxSession());
		return url;
	};

	api.getMboxSession = function() {
		var cookie = Cog.Cookie.read("mbox");
		var cookiePattern = /session#([^#]+)#/;
		if (cookie) {
			var matcher = cookie.match(cookiePattern);
			return matcher ? matcher[1] : "";
		}
	};

	api.init = function() {
		urlUtil = this.external.urlUtil;
		runmodeUtil = this.external.runmodeUtil;
	};

	Cog.registerStatic({
		name: "target.handler",
		api: api,
		sharedApi: sharedApi,
		requires: [{
			name: "utils.url",
			apiId: "urlUtil"
		}, {
			name: "utils.status",
			apiId: "runmodeUtil"
		}]
	});

})(Cog.jQuery());
