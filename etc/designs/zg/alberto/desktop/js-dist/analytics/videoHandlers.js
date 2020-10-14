(function() {
	"use strict";

	var api = {};
	var utils;
	var ctConstants;

	api.init = function() {
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("video", ctConstants.videoPlays, playHandler);
			Cog.addListener("video", ctConstants.videoProgress, progressHandler);
			Cog.addListener("video", ctConstants.videoCompletes, completeHandler);
			Cog.addListener("video", ctConstants.VideoFastForwarded, fastforwardHandler);
		}
	}

	function playHandler(event) {
		var label = createLabel([ctConstants.youtube, event.eventData.videoTitle, event.eventData.videoId]);
		utils.pushComponent("Video", event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		pushVideo(event.eventData.videoId, event.eventData.videoTitle);
		utils.addTrackedEvent(ctConstants.videoPlays, label, ctConstants.engagement, ctConstants.interest);
	}

	function progressHandler(event) {
		var label = createLabel([event.eventData.videoTitle, "Video Progress", event.eventData.progress]);
		utils.pushComponent("Video", event.eventData.componentPosition, ctConstants.custom, ctConstants.read);
		pushVideo(event.eventData.videoId, event.eventData.videoTitle);
		utils.addTrackedEvent(ctConstants.videoProgress, label, ctConstants.custom, ctConstants.read);
	}

	function completeHandler(event) {
		var label = createLabel([ctConstants.youtube, event.eventData.videoTitle, event.eventData.videoId]);
		utils.pushComponent("Video", event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		pushVideo(event.eventData.videoId, event.eventData.videoTitle);
		utils.addTrackedEvent(ctConstants.videoCompletes, label, ctConstants.engagement, ctConstants.interest);
	}

	function fastforwardHandler(event) {
		var label = createLabel([event.eventData.videoTitle, event.eventData.videoId]);
		utils.pushComponent("Video", event.eventData.componentPosition, ctConstants.engagement, ctConstants.other);
		pushVideo(event.eventData.videoId, event.eventData.videoTitle);
		utils.addTrackedEvent(ctConstants.VideoFastForwarded, label, ctConstants.engagement, ctConstants.other);
	}

	function createLabel(elements) {
		return elements.filter(Boolean).join(" - ");
	}

	function pushVideo(videoId, videoTitle) {
		digitalData.video = [];
		digitalData.video.push({
			videoid: videoId,
			videoname: videoTitle
		});
	}

	Cog.registerStatic({
		name: "analytics.videoHandlers",
		api: api,
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
})();
