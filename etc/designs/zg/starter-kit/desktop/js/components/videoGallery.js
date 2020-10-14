/**
 * Video Gallery
 */

(function($) {
	"use strict";

	var api = {},
		features = [
			"playpause",
			"progress",
			"current",
			"duration",
			"tracks",
			"volume",
			"fullscreen"
		],
		refs = {
			thumbnailsListContainerSelector: ".videoGallery-list",
			thumbnailsArrowsSelector: ".videoGallery-arrow",
			descriptionSelector: ".videoGallery-description",
			titleSelector: ".videoGallery-heading",
			videoWrapper: ".videoGallery-video"
		};

	function provideArrayOfSources(domElement) {
		var data = $(domElement).data(),
			sources = [
				{
					src: data.srcMp4,
					type: "video/mp4"
				},
				{
					src: data.srcOgg,
					type: "video/ogg"
				},
				{
					src: data.srcWebm,
					type: "video/webm"
				}
			];
		return _.filter(sources, "src");
	}

	function VideoGallery($el) {
		this.$el = $el;
		this.$video = $el.find("video");
		this.mediaElement = null;

		this.$thumbnails = this.$el.find(refs.thumbnailsListContainerSelector);
		this.$thumbnailsList = this.$thumbnails.find("ul");
		this.$thumbnailsItems = this.$thumbnails.find("li");

		this.$arrows = this.$el.find(refs.thumbnailsArrowsSelector);
		this.listContainerWidth = this.$thumbnails.width();

		this.thumbnailWidth = this.$thumbnailsItems.eq(0).outerWidth(true);

		this.autoPlayNext = this.$el.find(refs.videoWrapper).data("autoplay-next-video");

		this.initialize();
		this.bindEvents();
	}

	VideoGallery.prototype = {
		initialize: function() {
			var self = this;

			this.$thumbnailsList.css("width", this.thumbnailWidth * this.$thumbnailsItems.length);

			this.$video.mediaelementplayer({
				features: features,
				enableAutosize: true,
				plugins: ["flash"],
				pluginPath: api.external.settings.themePath + "/assets/swf/",
				flashName: "flashmediaelement.swf",
				success: this.onMejsSuccess.bind(this)
			});

			function recalculateListWith() {
				self.listContainerWidth = self.$thumbnails.width();
				self.$thumbnailsList.css({left: 0});
				self.$arrows.filter(".videoGallery-arrow-left").addClass("is-disabled");
				self.$arrows.filter(".videoGallery-arrow-right").removeClass("is-disabled");
			}

			$(window).resize($.throttle(150, recalculateListWith));
		},

		bindEvents: function() {
			var self = this;

			Cog.addListener("overlay", "close", this.onOverlayClose, {scope: this, disposable: true});

			this.$thumbnailsItems.on("click", function() {
				var $this = $(this);

				self.reloadVideo({
					src: provideArrayOfSources($this),
					autoplay: true,
					title: $this.data("title"),
					poster: $this.find("img").attr("src"),
					description: $this.data("description")
				});

				self.$thumbnailsItems.removeClass("is-active");
				$this.addClass("is-active");
			});

			this.$arrows.click("click", function() {
				self.$thumbnailsList.stop(false, true);

				var $this = $(this),
					listOuterWidth = self.thumbnailWidth * self.$thumbnailsItems.length,
					left = parseInt(self.$thumbnailsList.css("left"), 10),
					vector = $this.hasClass("videoGallery-arrow-left") ? 1 : -1,
					nextLeft = left + (self.thumbnailWidth * vector),
					maxLeft = listOuterWidth - self.listContainerWidth +
						(self.listContainerWidth % self.thumbnailWidth);

				self.$arrows.removeClass("is-disabled");

				if (nextLeft <= 0 && (-1) * nextLeft <= maxLeft) {
					self.$thumbnailsList.animate({left: nextLeft});
				} else {
					$this.addClass("is-disabled");
				}

				nextLeft += self.thumbnailWidth * vector;
				if (!(nextLeft <= 0 && (-1) * nextLeft <= maxLeft)) {
					$this.addClass("is-disabled");
				}
			});
		},

		reloadVideo: function(data) {
			var mediaElement = this.mediaElement,
				$descriptionContainer = this.$el.find(refs.descriptionSelector),
				$titleContainer = this.$el.find(refs.titleSelector);

			mediaElement.pause();
			mediaElement.setSrc(data.src);
			mediaElement.load();

			if (data.poster) {
				this.$video.attr("poster", data.poster);
				this.$video.parents(".mejs-inner").find(".mejs-poster").css({
					"background-image": "url('" + data.poster + "')",
					"display": "block"
				});
			}

			if (data.autoplay) {
				mediaElement.play();
			}

			$descriptionContainer.text(data.description);
			$titleContainer.text(data.title);
		},

		onOverlayClose: function() {
			if (this.$el.parents(".overlay-container").size()) {
				this.mediaElement.stop();
				this.mediaElement.remove();
				Cog.finalize(this.$el);
			}
		},

		onMejsSuccess: function(mediaElement) {
			var self = this,
				$thumbnailsItems = this.$thumbnailsItems;

			this.mediaElement = mediaElement;

			mediaElement.addEventListener("ended", function() {
				var $nextThumbnail = $thumbnailsItems.filter(".is-active").eq(0).next();

				if ($nextThumbnail.length) {
					self.reloadVideo({
						src: provideArrayOfSources($nextThumbnail),
						autoplay: self.autoPlayNext,
						title: $nextThumbnail.data("title"),
						poster: $nextThumbnail.find("img").attr("src"),
						description: $nextThumbnail.data("description")
					});

					$thumbnailsItems.removeClass("is-active");
					$nextThumbnail.addClass("is-active");
				}
			});
		}
	};

	api.onRegister = function(scope) {
		new VideoGallery(scope.$scope);
	};

	Cog.registerComponent({
		name: "videoGallery",
		api: api,
		selector: ".videoGallery",
		requires: [
			{
				name: "utils.bodySettings",
				apiId: "settings"
			}
		]
	});
}(Cog.jQuery()));
