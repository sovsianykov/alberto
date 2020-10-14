/**
 * Adobe Target - util methods
 */

(function($) {
	"use strict";
	var api = {};
	var	sharedApi = {};
	var urlUtil;

	var RECOMMENDATIONS_HOST = "https://unilever.tt.omtrdc.net/m2/unilever/ubox/raw";

	var DEFAULT_MBOX = "adobe-templated-mbox";

	sharedApi.safeCreateMbox = function(params) {
		if (sharedApi.isTargetEnabled()) {
			sharedApi.createMbox(params);
		} else {
			console.error("Target is disabled for this domain");
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

	sharedApi.trackClicks = function($rootItem, mboxName) {
		if (sharedApi.isTargetEnabled()) {
			mboxName = mboxName || DEFAULT_MBOX;
			$rootItem.find("a").click(function() {
				adobe.target.trackEvent({
					"mbox": mboxName,
					"type": "click"
				});
			});
		}
	};

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
	};

	Cog.registerStatic({
		name: "target.handler",
		api: api,
		sharedApi: sharedApi,
		requires: [
			{
				name: "utils.url",
				apiId: "urlUtil"
			}
		]
	});

})(Cog.jQuery());
