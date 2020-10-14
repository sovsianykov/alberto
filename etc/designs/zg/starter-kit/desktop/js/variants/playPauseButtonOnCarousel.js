/* Play And Pause Button on Carousel Component */
(function($) {
	"use strict";
	var api = {};
	var CLASSES = {
		autoPlayButton: "auto-play-pause-button"
	};

	var text = {
		play: "Play animation",
		pause: "Pause animation"
	};

	function ButtonOnCarousel($el) {
		this.$el = $el;
		this.$autoPlayButton = this.$el.find(".auto-play-pause-button");
		this.autoRotate = this.$el.find(".carousel-slides").data("rotate");

		this.addPlayButton();
		this.bindUIEvents();
	}

	ButtonOnCarousel.prototype = {
		bindUIEvents: function() {
			$(document).on("click", "." + CLASSES.autoPlayButton, function(e) {
				var autoPlay = e.target.getAttribute("data-autoplay");
				Cog.fireEvent("Carousel", "carouselPlayPause", {
					autoplay: autoPlay
				});
				if (autoPlay === "true") {
					this.updateButton("false", text.pause);
				} else {
					this.updateButton("true", text.play);
				}
			}.bind(this));

			if (this.autoRotate) {
				Cog.fireEvent("Carousel", "carouselPlayPause", {
					autoplay: true
				});
				this.updateButton("false", text.pause);
			}
		},
		addPlayButton: function() {
			this.$el.find(".component-content").append("<button class=" + CLASSES.autoPlayButton + " data-autoplay=" + !this.setButtonState + "><span class='sr-only'>" + text.play + "</span></button>");
		},
		updateButton: function(autoPlay, screenReaderText) {
			var $playPauseButton = this.$el.find(".component-content").find("." + CLASSES.autoPlayButton);
			$playPauseButton.attr("data-autoplay", autoPlay);
			$playPauseButton.find(".sr-only").text(screenReaderText);
		}
	};

	api.onRegister = function(scope) {
		new ButtonOnCarousel(scope.$scope);
	};

	Cog.registerComponent({
		name: "enable-carousel-autoplay",
		api: api,
		selector: ".enable-carousel-autoplay"
	});
})(Cog.jQuery());
