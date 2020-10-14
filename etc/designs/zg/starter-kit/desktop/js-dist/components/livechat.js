/* globals doT, liveagent */
(function($) {
	"use strict";

	var eventsDefinition;
	var analyticsUtils;

	function livechat($holder, config) {
		var $content = $holder.find(".livechat-content");
		var $template = $holder.find(".livechat-template");
		var $liveChatOffline = $holder.find(".livechat-offline button,.livechat-offline a");
		function templateData(state, msg) {
			return {
				state: state,
				title: config.title,
				talkToUsMessage: config.talkToUsMessage,
				message: msg
			};
		}

		function disableFocusForOffline() {
			$liveChatOffline.attr("tabindex","-1");
		}

		function createElements() {
			if ($template.length === 0) { // no template, HTML is ready
				return;
			}
			var template = doT.template($template.text());
			var html = [
				templateData("online", config.chatOnlineMessage),
				templateData("offline", config.chatOfflineMessage)
			].reduce(function(a, b) {
				return a + template(b);
			}, "");

			$content.html(html);
		}

		function loadScript() {
			return window.liveagent ? $.when() : $.ajax({
				url: config.salesforceDeploymentJsPath,
				dataType: "script",
				cache: true
			});
		}

		function addHandlers() {
			$holder.on("click", function() {
				if ($content.find(".livechat-online").is(":visible")) {
					Cog.fireEvent("livechat", eventsDefinition.CLICK.LIVECHAT_BUTTON_CLICK);
					liveagent.startChatWithWindow(config.salesforceButtonId, config.salesforceButtonId);
				}
			});
			disableFocusForOffline();
		}

		function initLiveAgent() {
			liveagent.init(config.salesforceLiveAgentEndpointUrl, config.salesforceOrgId, config.salesforceDeploymentId);
			liveagent.showWhenOffline(config.salesforceButtonId, $content.find(".livechat-offline")[0]);
			liveagent.showWhenOnline(config.salesforceButtonId, $content.find(".livechat-online")[0]);
			liveagent.addButtonEventHandler(config.salesforceButtonId, function(e) {
				if (liveagent.BUTTON_EVENT && e === liveagent.BUTTON_EVENT.BUTTON_AVAILABLE) {
					$holder.addClass("is-online").find(".component-content").removeClass("loading");
				} else if (liveagent.BUTTON_EVENT && e === liveagent.BUTTON_EVENT.BUTTON_UNAVAILABLE) {
					$holder.removeClass("is-online").find(".component-content").removeClass("loading");
				}
			});
		}

		if (!$content.length) {
			return;
		}

		loadScript()
			.then(createElements)
			.then(addHandlers)
			.then(initLiveAgent);
	}

	var api = {
		onRegister: function(scope) {
			eventsDefinition = this.external.eventsDefinition;
			analyticsUtils = this.external.utils;
			var $el = scope.$scope;
			var config = $el.find("[data-livechat]").data("livechat") || {};
			livechat($el, config);
		}
	};

	Cog.registerComponent({
		name: "livechat",
		api: api,
		selector: ".livechat",
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
}(Cog.jQuery()));
