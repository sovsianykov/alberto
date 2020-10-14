/**
 * Utils - URL - url modification helpers
 */

(function() {
	"use strict";
	var api = {},
		sharedApi = {};

	/* @CQ.shared.HTTP.setSelector */
	sharedApi.setSelector = function(url, selector, index) {

		var post = "";
		var pIndex = url.indexOf("?");
		if (pIndex === -1) {
			pIndex = url.indexOf("#");
		}
		if (pIndex !== -1) {
			post = url.substring(pIndex);
			url = url.substring(0, pIndex);
		}

		index = index ? index : 0;

		var selectors = sharedApi.getSelectors(url);
		var ext = url.substring(url.lastIndexOf("."));
		// cut extension
		url = url.substring(0, url.lastIndexOf("."));
		// cut selectors
		var fragment = (selectors.length > 0) ? url.replace("." + selectors.join("."), "") : url;

		if (selectors.length > 0) {
			for (var i = 0; i < selectors.length; i++) {
				if (index === i) {
					fragment += "." + selector;
				} else {
					fragment += "." + selectors[i];
				}
			}
		} else {
			fragment += "." + selector;
		}

		return fragment + ext + post;
	};

	/* @CQ.shared.HTTP.getSelectors */
	sharedApi.getSelectors = function(url) {
		var selectors = [];
		url = url || window.location.href;
		url = sharedApi.removeParameters(url);
		url = sharedApi.removeAnchor(url);
		var fragment = url.substring(url.lastIndexOf("/"));
		if (fragment) {
			var split = fragment.split(".");
			if (split.length > 2) {
				for (var i = 0; i < split.length; i++) {
					// don't add node name and extension as selectors
					if (i > 0 && i < split.length - 1) {
						selectors.push(split[i]);
					}
				}
			}
		}

		return selectors;
	};

	/* @_g.HTTP.removeParameters */
	sharedApi.removeParameters = function(url) {
		if (url.indexOf("?") !== -1) {
			return url.substring(0, url.indexOf("?"));
		}
		return url;
	};

	/* @_g.HTTP.removeAnchor*/
	sharedApi.removeAnchor = function(url) {
		if (url.indexOf("#") !== -1) {
			return url.substring(0, url.indexOf("#"));
		}
		return url;
	};

	sharedApi.addOrUpdateQueryParam = function(uri, key, value) {
		var regExp = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
		var separator = uri.indexOf("?") !== -1 ? "&" : "?";
		if (uri.match(regExp)) {
			return uri.replace(regExp, "$1" + key + "=" + value + "$2");
		} else {
			return uri + separator + key + "=" + value;
		}
	};

	/**
	 * Get queryString parameters
	 *
	 * @memberOf sharedApi
	 *
	 * @param  {string} queryString optional
	 * @param  {boolean} noCache optional
	 * @return {object}
	 *
	 * @example
	 * var qsParams = getQueryParams(); returns object key/value cached
	 * var qsParams = getQueryParams(location.search, true); returns object key/value not cached
	 * JSON.stringify(getQueryParams("http://test.com?test1=foo")) 		=== `{"test1":"foo"}`
	 * JSON.stringify(getQueryParams("test1=")) 						=== `{"test1":""}`
	 * JSON.stringify(getQueryParams(location.href)) 					=== `{}` (assuming no QS params)
	 * JSON.stringify(getQueryParams("http://test.com?")) 				=== `{}`
	 * JSON.stringify(getQueryParams("http://test.com?test1#hash"))		=== `{"test1":""}`
	 * JSON.stringify(getQueryParams("?t1=foo&t2=bar&t3&t4=&t5=baz#1")) === `{"t1":"foo","t2":"bar","t3":"","t4":"","t5":"baz"}`
	 * JSON.stringify(getQueryParams("?url=http%3A%2F%2Ftest.com%3F")) 	=== `{"url":"http://test.com?"}`
	 *
	 */
	sharedApi.getQueryParams = function(queryString, noCache) {
		if (this.queryStringParams && !noCache) {
			return this.queryStringParams;
		}
		queryString = queryString || location.search;
		if (queryString === location.href) {
			queryString = location.search;
		}
		queryString = queryString.split("?").pop();
		queryString = queryString.split("#").shift();
		queryString = queryString.split("+").join(" ");
		var params = {};
		var items = queryString.split("&");
		var i = 0;
		var l = items.length;
		var item;
		for (;i < l; i++) {
			item = items[i].split("=");
			if (item[0]) {
				params[decodeURIComponent(item[0])] = item.length > 1 ? decodeURIComponent(item[1]) : "";
			}
		}
		this.queryStringParams = params;
		return params;
	};

	sharedApi.addWcmModeIfNeeded = function(hxr, ops) {
		var wcmmode = "wcmmode=disabled";
		if (_.includes(location.search, wcmmode) && !_.includes(ops.url, wcmmode)) {
			var amp = _.includes(ops.url, "?") ? "&" : "?";
			ops.url+= amp + wcmmode;
		}
		return ops;
	};

	Cog.registerStatic({
		name: "utils.url",
		api: api,
		sharedApi: sharedApi
	});

})();
