(function($) {
	"use strict";

	var api = {};
	var utils;
	var ctConstants;

	var options = {
		button: {
			selector: "imageGallery-with-zoom__button"
		},
		zoom: {
			selector: "imageGallery-with-zoom__overlay"
		},
		img: {
			selector: "imageGallery-with-zoom__image"
		}
	};

	var CLASSES = {
		isActive: "is-active",
		spinner: "spinner"
	};

	function GalleryZoom($item) {
		this.$item = $item;
		var zoomButton = '<button class="' + options.button.selector + '"></button>';
		var $zoomButton = $(zoomButton).appendTo(this.$item);
		var $galleryView = this.$item.find(".imageGallery-view");
		var overlayHTML = '<div class="' + options.zoom.selector + '"></div>';
		var $overlay;

		var closeZoom = function(evt) {
			if (evt.type === "keyup" && evt.keyCode !== 27) {
				return; // if event type is keyup, close on esc key only.
			}
			var duration = getDuration($overlay);
			$(window).off("resize", closeZoom); // detach event listener
			$(document).off("keyup", closeZoom); // detach event listener
			$overlay.off();
			$overlay.removeClass("is-active"); // turn off the 'close' cursor
			$overlay.css("opacity", 0); // fade out overlay
			setTimeout(function() {
				$overlay.remove(); // remove completely, create new $overlay for each button press)
			}, duration);
		};
		var loadImage = function(ops) {
			var img = new Image();
			img.src = ops.src;
			img.setAttribute("alt", ops.alt || "");
			img.setAttribute("aria-visible", "true");
			$overlay.addClass(CLASSES.isActive);
			$overlay.append("<div class='" + CLASSES.spinner + "'></div>");
			img.addEventListener("load", function() {
				var imgW = img.naturalWidth;
				var imgH = img.naturalHeight;
				var winW = $(window).width();
				var $img = $(img);

				img.setAttribute("height", imgH);
				img.setAttribute("width", imgW);
				
				$overlay.append($img);
				$img
					.css({minWidth: imgW + "px"})
					.addClass(options.img.selector);
				$overlay.find("." + CLASSES.spinner).remove();
				if ($img.css("position") === "static") {
					// for mobile we put the image into the centre
					$overlay.scrollLeft((imgW / 2) - (winW / 2));
				} else {
					// else scroll image with mouse position
					scrollImage($img);
				}
			});
		};
		var scrollImage = function($img) {
			var imgH = $img.height();
			var winH = $(window).height();
			var a;
			var b;
			var c;
			var mouseMove = function(e) {
				// method copied from Dove.us
				a = imgH - winH;
				b = 1 - e.clientY / winH;
				c = -a + b * a;
				$img.css("top", c + "px");
			};

			$overlay.on("mousemove", mouseMove);

		};
		var getAlt = function($img) {
			var alt = $img.attr("alt") || document.title;
			return alt;
		};
		var getDuration = function($el) {
			// get the current opacity transition duration from the css
			// and convert it to ms if it's not already
			var i = 10;
			var duration = $el.css("transition-duration");
			if (duration && duration.indexOf(" ") === -1) {
				i = parseFloat(duration);
			}
			if (duration && duration.indexOf("ms") === -1) {
				i = i * 1000;
			}
			return i;
		};
		var launchZoom = function() {
			var $img = $galleryView.find("img");
			utils.addTrackedEvent(ctConstants.widgets, "zoom", ctConstants.custom,
				"Others", {
					"nonInteractive": {
						"nonInteraction": 1
					}
				}, ctConstants.trackEvent);

			//reading image path from src and removing renditions from image path
			var imageName, imagePath;
			imageName = imagePath = $img.attr("src");
			imageName = imageName.split("/").pop().split(".");
			imageName = imageName[0] + "." + imageName[imageName.length - 1];

			// concating image name with image path
			imagePath = imagePath.split("/");
			imagePath.splice(-1, 1);
			var src = imagePath.join("/") + "/" + imageName;

			var alt = getAlt($img);

			// todo: remove this and add to CSS
			// var styles = $(".zoomStyles").length;
			// if (!styles) {
			//	$("body").append(CSS)
			// }

			if (src) {// something is wrong, no image found, ignoring request to zoom
				$overlay = $(overlayHTML)
					.appendTo("body")
					.addClass(options.zoom.selector)
					.on("click", closeZoom);

				$(window).on("resize", closeZoom);
				$(document).on("keyup", closeZoom);

				requestAnimationFrame(function() {
					$overlay.css("opacity", 1);
					loadImage({src: src, alt: alt});
				});
			}
		};

		$zoomButton.on("click", launchZoom);
	}

	api.onRegister = function(scope) {
		var isPersonalizationEnabled = $(".shopify__form--personalisation-true").length || $(".shopify__form__personalisation").length;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;

		if (!isPersonalizationEnabled) {
			new GalleryZoom(scope.$scope);
		}
	};

	Cog.registerComponent({
		name: "gallery-zoom",
		api: api,
		selector: ".imageGallery-with-zoom",
		requires: [{
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
