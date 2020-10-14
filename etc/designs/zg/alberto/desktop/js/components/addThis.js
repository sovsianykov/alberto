/**
 * addThis (cookieless) - desktop/js/components/addThis.js
 */
(function($) {
	"use strict";

	var api = {};
	var noneStatus;
	var refusedStatus;
	var getCookieqStatus;
	var analyticsDef;
	var analyticsUtils;

	function AddThis($el) {
		this.$el = $el;
		this.$channelContainerLinks = this.$el.find(".addthis_toolbox a");
		this.componentPosition = analyticsUtils.getComponentPosition(this.$el);

		this.toggleVisibility();
		this.addEventListeners();
	}

	AddThis.prototype = {
		addEventListeners: function() {
			this.$channelContainerLinks.click(function(event) {
				Cog.fireEvent("addThis", analyticsDef.CLICK.ADDTHIS_SHARE, {
					channel: this.getChannelName(event.target),
					position: this.componentPosition
				});
			}.bind(this));
			Cog.addListener("utils.cookieq", "statusChanged", this.toggleVisibility.bind(this));
		},

		getChannelName: function(target) {
			var result;
			if (target.tagName.toLowerCase() === "a") {
				result = $(target).attr("title");
			} else {
				result = $(target).closest("a").attr("title");
			}
			return result || target.text || "";
		},

		toggleVisibility: function() {
			var status = getCookieqStatus();

			if (status.current === refusedStatus || status.current === noneStatus) {
				this.$el.addClass("is-disabled");
			} else {
				this.$el.removeClass("is-disabled");
			}
		}
	};

	api.init = function(scope) {
		var scriptKey = scope.find(".addthis-script").data("key") || "";
		var scriptPath = scope.find(".addthis-script").data("path") || "";

		initializeScript(scriptKey, scriptPath);
	};

	api.onRegister = function(scope) {
		getCookieqStatus = this.external.cookieq.getStatus;
		noneStatus = this.external.cookieq.getAvailableStatuses().NONE;
		refusedStatus = this.external.cookieq.getAvailableStatuses().REFUSED;
		analyticsUtils = this.external.utils;
		analyticsDef = this.external.eventsDefinition;

		new AddThis(scope.$scope);
	};

	function initializeScript(scriptKey, scriptPath) {
		if (scriptKey && scriptPath) {
			window.addthis_config = window.addthis_config || {}; //jshint ignore:line
			window.addthis_config.pubid = scriptKey; //jshint ignore:line

			//Initialize AddThis script
			var addthisScript = document.createElement("script");
			addthisScript.setAttribute("src", scriptPath);
			document.body.appendChild(addthisScript);
		}
	}

	var load = function() {
		var addThisLazyLoadJs = document.querySelector(".addThis-js-lazyLoad");
		if (addThisLazyLoadJs) {
			var scriptKey = addThisLazyLoadJs.getAttribute("data-key");
			var scriptPath = addThisLazyLoadJs.getAttribute("data-path");
			initializeScript(scriptKey, scriptPath);
		}
	};
	window.runOnWindowLoad(load);

	Cog.registerComponent({
		name: "addThis",
		api: api,
		selector: ".addthis",
		requires: [
			{
				name: "utils.cookieq",
				apiId: "cookieq"
			},
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
