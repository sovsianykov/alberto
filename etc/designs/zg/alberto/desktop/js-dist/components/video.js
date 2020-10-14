/*global YT*/

(function($) {
	"use strict";

	var scriptPromise = $.Deferred();
	var trackingInterval = 500;
	var ctConstants;
	var analyticsUtils;
	var scriptLoaded = false;
	var checkEventsRegistry = [];
	var lastSentEvent;

	window.onYouTubeIframeAPIReady = function() {
		scriptPromise.resolve();
	};

	function youtube($holder, config) {
		config = config || {};
		var holder = document.createElement("div");
		var playerId = holder.id = "yt-" + Math.round(Date.now() * Math.random());
		var lastProgressSent = 0; //prevents from firing the same event twice
		var player;
		var videoDuration;
		var timer;
		$holder.append(holder);

		if (config.cookieqActive) {
			config.api = "https://cdn.baycloud.com/YouTube/iframe_api";
		} else if (config.oneTrustActive) {
			config.api = "https://yt.unileversolutions.com/iframe_api";
		}

		function loadScript() {
			var $ytScript = $("#ytapi");
			if (!$ytScript.length) {
				$ytScript = $(document.createElement("script"));
				$ytScript.attr({
					src: config.api || "https://www.youtube.com/iframe_api",
					id: "ytapi"
				});
				$("head").prepend($ytScript);
				scriptLoaded = true;
			}
		}

		function createPlayer() {
			var playerVars = {
				"modestbranding": 1, // no logo
				"autoplay": config.autoplay ? 1 : 0,
				"controls": config.showControls ? 1 : 0,
				"showinfo": 0, // no info
				"rel": 0, // no related
				"fs": 1, // allow fullscreen
				"enablejsapi": 1,
				"iv_load_policy": 3, // no annotations
				"html5": 1
			};

			function onVideoReady(e) {
				player = e.target;

				$(player.getIframe())
					.attr("unselectable", "on")
					.attr("tabindex", "-1");

				if (config.mute) {
					player.mute();
				}

				$holder.addClass("video-ready");

				if (!config.videoTitle && player.getVideoData) {
					config.videoTitle = player.getVideoData().title || "";
				}

				if (!videoDuration && player.getDuration) {
					videoDuration = player.getDuration();
				}

				var overlayCloseListener = Cog.addListener("overlay", "close", function() {
					clearInterval(timer);
					if (player.pauseVideo) {
						player.pauseVideo();
					}
					Cog.removeListener(overlayCloseListener);
				});

				config.fastforwardTriggered = false;
			}

			function onVideoStart() {
				$holder.addClass("video-ready");
				timer = setInterval(trackProgress, trackingInterval);

				if (lastProgressSent === 100) {
					lastProgressSent = 0;
				}
				if (lastProgressSent === 0 && lastSentEvent !== ctConstants.videoPlays) {
					Cog.fireEvent("video", ctConstants.videoPlays, {
						componentPosition: config.componentPosition,
						videoId: config.id,
						videoTitle: config.videoTitle
					});
					lastSentEvent = ctConstants.videoPlays;
				}
			}

			function onVideoEnd() {
				if (config.loop) {
					player.playVideo();
				}

				Cog.fireEvent("video", ctConstants.videoCompletes, {
					componentPosition: config.componentPosition,
					videoId: config.id,
					videoTitle: config.videoTitle
				});
				lastSentEvent = ctConstants.videoCompletes;

				lastProgressSent = 100;
				clearInterval(timer);
			}

			var YTPlayerObject = {
				videoId: config.id,
				width: "100%",
				height: "100%",
				playerVars: playerVars,
				events: {
					onReady: onVideoReady,
					onStateChange: function(e) {
						switch (e.target.getPlayerState()) {
							case 1:
								onVideoStart();
								break;
							case 0:
								onVideoEnd();
								break;
						}
					},
					onPlaybackRateChange: trackPlaybackRateChange
				}
			};
			if (config.oneTrustActive) {
				YTPlayerObject.host = "https://www.youtube-nocookie.com";
			}
			return new YT.Player(playerId, YTPlayerObject);

		}

		function trackProgress() {
			var progress = parseInt(player.getCurrentTime() / videoDuration * 100, 10);

			if (progress - lastProgressSent >= 25) { //catch progress at the moment of passing
				lastProgressSent += 25;

				Cog.fireEvent("video", ctConstants.videoProgress, {
					componentPosition: config.componentPosition,
					videoId: config.id,
					videoTitle: config.videoTitle,
					progress: lastProgressSent + "%"
				});
				lastSentEvent = ctConstants.videoProgress;
			}
		}

		function trackPlaybackRateChange(rate) {
			if (!config.fastforwardTriggered && rate.data > 1) {
				Cog.fireEvent("video", ctConstants.VideoFastForwarded, {
					componentPosition: config.componentPosition,
					videoId: config.id,
					videoTitle: config.videoTitle
				});
				config.fastforwardTriggered = true;
				lastSentEvent = ctConstants.VideoFastForwarded;
			}
		}

		function loadOnScreen() {
			var $w = $(window);

			function isReadyToLoad() {
				var top = $holder.offset().top;
				var bottomBound = $w.scrollTop() + $w.innerHeight() * 1.5;
				return document.readyState === "complete" && top < bottomBound;
			}

			function check() {
				if (isReadyToLoad()) {
					loadScript();
				}
				if (scriptLoaded) {
					$.each(checkEventsRegistry, function(index, item) {
						$w.off("scroll", item);
					});
					checkEventsRegistry = [];
				}
			}

			var checkListener = $.throttle(100, false, check);
			checkEventsRegistry.push(checkListener);
			$w.on("scroll", checkListener);
			window.runOnWindowLoad(check);
			check();
		}

		if (config.isConfigured) {
			loadOnScreen();
			scriptPromise.then(createPlayer);
		}
	}

	var api = {
		onRegister: function(scope) {
			var $el = scope.$scope;
			var $wrapper = $el.find(".video-content");
			var config = $wrapper.data("video") || {};
			var videoautoplay = typeof Modernizr.videoautoplay === "undefined" ? true : Modernizr.videoautoplay;

			ctConstants = this.external.eventsDefinition.ctConstants;
			analyticsUtils = this.external.utils;

			config.autoplay = videoautoplay && config.autoplay;
			config.componentPosition = analyticsUtils.getComponentPosition($el);

			if ($el.hasClass("as-background")) {
				this.external.coverBg($wrapper);

				// Variation used as config shortcut
				config.autoplay = config.loop = config.mute = true;
				config.showControls = false;

				if (!Modernizr.videoautoplay) {
					return;
				}
			}

			$wrapper.addClass("cover-ready");
			youtube($el.find(".video-holder"), config);
		}
	};

	Cog.registerComponent({
		name: "video",
		api: api,
		selector: ".video",
		requires: [{
				name: "utils.coverBg",
				apiId: "coverBg"
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
