/**
 * Image Gallery
 */

(function($) {
	"use strict";

	var api = {};
	var refs = {
		componentName: "imageGallery",
		thumbnailsContainerSelector: ".imageGallery-thumbnails",
		imageViewOverlaySelector: ".imageGallery-view-overlay",
		imageViewSelector: ".imageGallery-view",
		thumbnailsListContainerSelector: ".imageGallery-list",
		mainArrowsSelector: ".imageGallery-view .imageGallery-arrow",
		thumbnailsArrowsSelector: ".imageGallery-thumbnails .imageGallery-arrow",
		thumbnailsArrowsLeftClass: "imageGallery-arrow-left",
		arrowsLeftSelector: ".imageGallery-arrow-left",
		thumbnailsArrowsRightClass: "imageGallery-arrow-right",
		arrowsRightSelector: ".imageGallery-arrow-right",
		descriptionSelector: ".imageGallery-description",
		thumbnailsListInner: ".imageGallery-list-inner",
		thumbnailsList: ".imageGallery-list",
		personalisedText: "#personalised-curvature"
	};
	var Direction = {
		PREV: -1,
		NEXT: 1
	};
	var settings = {
		autoplay: false,
		loop: true,
		playTimeout: 4000
	};
	var analyticsDef;
	var analyticsUtils;
	var curvatureProperties = "M 0 80 q 120 -80 240 0";

	api.onRegister = function(scope) {
		function createPersonalisedSvg() {
			$(refs.imageViewSelector).prepend(
			'<svg class="personalised-text-svg">' +
				'<path id="curvature" d="' + curvatureProperties + '" stroke="blue" stroke-width="0" fill="none"></path>' +
				"<text>" +
					'<textPath id="personalised-curvature" startOffset="50%" text-anchor="middle" xlink:href="#curvature"></textPath>' +
				"</text>" +
			"</svg>");
		}

		function showNext($context) {
			var currentItem = $context.filter(".is-active"),
				$nextItem = currentItem.next();

			if ($nextItem.length) {
				$nextItem.trigger("click");
			} else if (settings.loop && settings.autoplay) {
				$context.eq(0).trigger("click");
			}
		}

		function showPrev($context) {
			var currentItem = $context.filter(".is-active"),
				$prevItem = currentItem.prev();

			if ($prevItem.length) {
				$prevItem.trigger("click");
			} else if (settings.loop && settings.autoplay) {
				$context.last().trigger("click");
			}
		}

		function centerActiveThumbnail($context) {
			var activeItem = $context.filter(".is-active"),
				currentItemPosition = activeItem.position();
			scrollThumbnails($context, currentItemPosition.left * -1);
		}

		function scrollThumbnails($context, to) {
			to += $thumbnailsList.parent().width() / 2 - $context.filter(".is-active").width() / 2;
			to = Math.max(to, -1 * $thumbnailsList.width() + $thumbnailsList.parent().width());
			to = Math.min(0, to);

			$thumbnailsList.animate({left: to});
		}

		function onPersonalisationTextChange(e) {
			var data = e.eventData;
			if (data && data.isInline) {
				data.personalisationText = data.personalisationText || "";
				if (data.personalisationText !== personalisationText) {
					personalisationText = data.personalisationText;
				}
				$mainImageContainer
				.attr("data-personalisation-text", data.personalisationText)
				.attr("data-personalisation-length", data.personalisationText.length)
				.attr("data-personalisation-ean", data.ean);
				$(refs.personalisedText).text(data.personalisationText);
			}
		}

		function onIndexChange() {
			$mainImageContainer.attr("data-active-index", $thumbnailsListContainer.find(".is-active").index() || 0);
		}

		var $this = scope.$scope,
			$mainImage = $this.find(refs.imageViewSelector + " img"),
			$mainPicture = $this.find(refs.imageViewSelector + " picture"),
			$mainImageContainer = $this.find(refs.imageViewSelector),
			$thumbnailsContainer = $this.find(refs.thumbnailsContainerSelector),
			$thumbnailsListContainer = $thumbnailsContainer.find(
				refs.thumbnailsListContainerSelector),
			$thumbnailsList = $thumbnailsListContainer.find(refs.thumbnailsListInner),
			$thumbnailsItems = $thumbnailsList.find("li"),
			$arrowsMain = $this.find(refs.mainArrowsSelector),
			$leftArrow = $this.find(refs.arrowsLeftSelector),
			$rightArrow = $this.find(refs.arrowsRightSelector),
			$arrowsThumbs = $this.find(refs.thumbnailsArrowsSelector),
			$descriptionContainer = $this.find(refs.descriptionSelector),
			$firstItem = $thumbnailsItems.eq(0),
			playingTimer,
			maxImageHeight = $mainImageContainer.data("height"),
			$image = ($mainPicture.length > 0) ? $mainPicture : $mainImage,
			personalisationText;

		Cog.addListener("shopify", "personalisationText.change", onPersonalisationTextChange);
		Cog.addListener("imageGallery", "index.update", onIndexChange);
		Cog.fireEvent("imageGallery", "index.update");

		swipeDetector(scope.$scope.get(0), function(swipeDirection) {
			// swipeDirection contains either "none", "left", "right", "top", or "down"
			if (swipeDirection === "left") {
				showNext($thumbnailsItems);
			} else if (swipeDirection === "right") {
				showPrev($thumbnailsItems);
			}
		}.bind(this));

		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;

		function setListWidth() {
			var thumbnailWidth = $firstItem.outerWidth(true),
				listOuterWidth = $thumbnailsItems.length * thumbnailWidth;
			$thumbnailsList.css("width", listOuterWidth);
		}

		if (settings.autoplay) {
			$mainImageContainer.on("click", function() {
				clearInterval(playingTimer);
				if ($this.hasClass("is-playing")) {
					$this.removeClass("is-playing");
				} else {
					playingTimer = setInterval(function() {
						var $activeItem = $thumbnailsItems.filter(".is-active"),
							$nextItem = $activeItem.next();
						if ($nextItem.length) {
							$nextItem.trigger("click");
						} else {
							$thumbnailsItems.eq(0).trigger("click");
						}
						Cog.fireEvent("imageGallery", "index.update");
					}, settings.playTimeout);
					$this.addClass("is-playing");
				}
			});
		}

		$thumbnailsItems.on("click", function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			var $this = $(this),
				$link = $this.find("a"),
				$linkImg = $link.find("img");

			if (!$this.hasClass("is-active")) {
				$thumbnailsItems.removeClass("is-active");
				$this.addClass("is-active");
				Cog.fireEvent("imageGallery", "index.update");

				$image.on("load", function() {
					$image.findSelf("img").fadeIn(200);
					$descriptionContainer.text($link.data("description"));
				});

				var thumbnailsListLeft = $thumbnailsList.parent().offset().left,
					thumbnailsListRight = thumbnailsListLeft +
						$thumbnailsList.parent().width(),

					thumbnailLeft = $this.offset().left,
					thumbnailRight = thumbnailLeft + $this.outerWidth(false);

				if (thumbnailsListLeft > thumbnailLeft) {
					$thumbnailsList.animate(
						{left: "+=" + (thumbnailsListLeft - thumbnailLeft)});
				} else if (thumbnailsListRight < thumbnailRight) {
					$thumbnailsList.animate(
						{left: "-=" + (thumbnailRight - thumbnailsListRight)});
				}

				$image.findSelf("img").fadeTo(200, 0, function() {

					if ($mainPicture.length > 0) {
						//update main picture content with image from thumbnail
						var thumbnailImgSrc = $linkImg.attr("src") || $linkImg.attr("data-src");
						var index = thumbnailImgSrc.indexOf(".");
						var thumbnailImgPath = thumbnailImgSrc.substring(0, index);
						var thumbnailImgExtension = thumbnailImgSrc.substring(index, index + 4);

						var $mainImg = $mainPicture.find("img");
						var src = determineSrc($mainImg, "src", thumbnailImgPath, thumbnailImgExtension);
						$mainImg.attr("src", src);
						$mainImg.attr("data-src", src);

						var $source = $mainPicture.find("source");
						$source.each(function() {
							var $this = $(this);
							var src = determineSrc($this, "srcset", thumbnailImgPath, thumbnailImgExtension);
							$this.attr("srcset", src);
							$this.attr("data-srcset", src);
						});

						$mainImg.removeAttr("width").fadeTo(200, 1);
					} else {
						var originalHeight = $linkImg.data("height"),
							correctHeight = !maxImageHeight ||
							originalHeight <= maxImageHeight ? originalHeight : maxImageHeight,
							originalWidth = $linkImg.data("width"),
							correctWidth = (correctHeight * originalWidth) / originalHeight;
						var imgSrc = $linkImg.attr("src");
						var originalImgSrc = imgSrc.includes(".rendition") ? imgSrc.substring(0, imgSrc.indexOf(".rendition")) : imgSrc;

						$mainImage.attr("width", parseInt(correctWidth, 10));
						$mainImage.attr("height", parseInt(correctHeight, 10));
						$mainImage.attr("src", originalImgSrc);
						$mainImage.fadeTo(200, 1);
					}

				});
			}
		});

		$arrowsThumbs.on("click", function(e) {
			e.preventDefault();
			e.stopPropagation();
			var vector = $(this).hasClass(refs.thumbnailsArrowsLeftClass) ?
				Direction.PREV : Direction.NEXT,
				currentScroll = parseInt($thumbnailsList.css("left"), 10),
				to = currentScroll - vector * $thumbnailsItems.eq(0).width() * 2;

			to -= $thumbnailsList.parent().width() / 2 -
				$thumbnailsItems.filter(".is-active").width() / 2;
			scrollThumbnails($thumbnailsItems, to);
		});

		$arrowsMain.on("click", function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			$thumbnailsList.stop(false, true);

			var $this = $(this),
				vector = $this.hasClass(refs.thumbnailsArrowsLeftClass) ? Direction.PREV : Direction.NEXT;

			if (vector === Direction.NEXT) {
				showNext($thumbnailsItems);
			} else {
				showPrev($thumbnailsItems);
			}

			centerActiveThumbnail($thumbnailsItems);
			$arrowsMain.removeClass("is-disabled");

		});

		var originalHeight = $image.findSelf("img").attr("height"),
			correctHeight = !maxImageHeight ||
				originalHeight <= maxImageHeight ? originalHeight : maxImageHeight,

			originalWidth = $image.findSelf("img").attr("width"),
			correctWidth = (correctHeight * originalWidth) / originalHeight;

		$image.attr("width", parseInt(correctWidth, 10));
		$image.attr("height", parseInt(correctHeight, 10));
		$firstItem.on("load", function() {
			setListWidth();
		});
		addEventListeners($rightArrow, $leftArrow, $this);
		createPersonalisedSvg();
	};

	function determineSrc($root, attribute, newPath, newExtension) {
		var src = $root.attr("data-src") || $root.attr(attribute);
		var path = src.substring(0, src.indexOf("."));

		return src.replace(path, newPath).replace(/.png/g, newExtension).replace(/.jpg/g, newExtension);
	}

	function addEventListeners($navNext, $navPrevious, $imageGallery) {
		$navNext.on("click", function() {
			onClickNavigation("NEXT", analyticsUtils.getComponentPosition($imageGallery));
		});
		$navPrevious.on("click", function() {
			onClickNavigation("PREVIOUS", analyticsUtils.getComponentPosition($imageGallery));
		});
	}

	function onClickNavigation(navDirect, position) {
		Cog.fireEvent("imageGallery", analyticsDef.CLICK.IMAGE_GALLERY_CLICK, {
			query: navDirect,
			componentPosition: position
		});
	}

	Cog.registerComponent({
		name: "imageGallery",
		api: api,
		selector: ".imageGallery",
		requires: [{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
		{
			name: "analytics.utils",
			apiId: "utils"
		}]
	});
})(Cog.jQuery());
