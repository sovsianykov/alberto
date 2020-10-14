/**
 * Carousel
 */

(function($) {
	"use strict";

	var api = {};
	var throttleTime = 150;
	var analyticsDef;
	var analyticsUtils;

	function Carousel($el, status) {
		this.$el = $el;
		this.$slidesList = this.$el.find(".carousel-slides");
		this.$slides = this.$slidesList.find(".carousel-slide");
		this.$firstImage = this.$slidesList.find(".carousel-slide:first-child img");
		this.$links = this.$slides.find("a");
		this.$controls = this.$el.find(".carousel-nav-item");
		this.$btnPrev = this.$el.find(".carousel-nav-prev");
		this.$btnNext = this.$el.find(".carousel-nav-next");

		this.slidesMaxHeight = this.$slidesList.data("height");
		this.delay = this.$slidesList.data("delay") * 1000 || 0;
		this.autoRotate = this.$slidesList.data("rotate");
		this.currentIndex = 0;
		this.status = status;
		this.componentPosition = analyticsUtils.getComponentPosition($el);
		this.isHoverOnCarousel = false;
		this.isDeviceSupportTouch = "ontouchstart" in window;
		this.isEnabledAutoPlayOnCarousel = this.$el.hasClass("enable-carousel-autoplay");

		this.init = function() {
			(new SlickCarousel()).init.call(this);
		};
		this.init();

		this.bindUIEvents();
		this.resizeView();
		this.handleAutoRotate(this.currentIndex);

		Cog.addListener("Carousel", "carouselPlayPause", function(e) {
			this.startAutoPlay = e.eventData.autoplay === true || e.eventData.autoplay === "true";
			this.handleAutoRotate(this.currentIndex);
		}.bind(this));
	}

	Carousel.prototype = {

		bindUIEvents: function() {
			analyticsUtils.trackLinks(this.$links, {
				componentName: analyticsDef.CLICK.CAROUSEL_CLICK,
				componentPosition: this.componentPosition
			});

			this.$controls.on("click", "a", function(e) {
				var $parent = $(e.target).parent();
				var index = this.$controls.index($parent);

				e.preventDefault();
				this.showSlide(index);
				this.trackNavigation(index + 1);
			}.bind(this));

			this.$btnPrev.on("click", "a", function(e) {
				e.preventDefault();
				this.trackNavigation("PREVIOUS");
				this.showPrevious();
			}.bind(this));

			this.$btnNext.on("click", "a", function(e) {
				e.preventDefault();
				this.trackNavigation("NEXT");
				this.showNext();
			}.bind(this));

			this.$slides.on("click", "img", function(e) {
				this.trackImageClick(e);
			}.bind(this));

			swipeDetector(this.$el.get(0), function(swipeDirection) {
				if (swipeDirection === "left") {
					this.showNext();
				} else if (swipeDirection === "right") {
					this.showPrevious();
				}
			}.bind(this));

			$(window).resize($.throttle(throttleTime, function() {
				this.resizeView();
			}.bind(this)));

			this.$btnNext.on("click", function() {
				this.trackNavigation("NEXT");
			}.bind(this));

			this.$btnPrev.on("click", function() {
				this.trackNavigation("PREVIOUS");
			}.bind(this));

			if (!this.enabledAutoPlayOnCarousel) {
				this.$slidesList.on("mouseenter", function() {
						this.isHoverOnCarousel = true;
					}.bind(this))
					.on("mouseleave", function() {
						this.isHoverOnCarousel = false;
						this.handleAutoRotate(this.currentIndex);
					}.bind(this));
			}

		},

		showSlide: function(nextIndex) {
			clearTimeout(this.timerId);

			var $current = this.$slides.eq(this.currentIndex);

			nextIndex = (nextIndex < 0) ? (this.$slides.length - 1) :
				((nextIndex >= this.$slides.length) ? 0 : nextIndex);

			if (Number(nextIndex) !== Number(this.currentIndex)) {
				this.$slides.stop(true, true);

				$current.removeClass("is-active").fadeOut(function() {
					$(this).removeClass("is-active");
					this.$controls.removeClass("is-active").eq(nextIndex).addClass("is-active");
				}.bind(this));

				this.$slides.eq(nextIndex).fadeIn(function() {
					$(this).addClass("is-active");
				});
			}

			this.currentIndex = nextIndex;
			this.handleAutoRotate(nextIndex);
		},

		showNext: function() {
			this.showSlide(this.currentIndex + 1);
		},

		showPrevious: function() {
			this.showSlide(this.currentIndex - 1);
		},

		resizeView: function() {
			if (this.status.isAuthor()) {
				return;
			}
			var maxHeight = 0;
			this.$el.removeClass("is-ready");
			if (this.$firstImage.is(".lazyload")) {
				// lazyload is enabled and image may or may not be loaded yet
				// trigger resize when when image loads
				this.$firstImage.on("load", function() {
					this.resizeView();
				}.bind(this));
				return;
			}
			this.$slides.each(function() {
				var height = Math.round($(this).height());
				maxHeight = height > maxHeight ? height : maxHeight;
			});

			if (this.slidesMaxHeight) {
				if (maxHeight > this.slidesMaxHeight) {
					maxHeight = this.slidesMaxHeight;
				}
			}

			this.$slidesList.css("height", maxHeight);
			this.$el.addClass("is-ready");
		},

		handleAutoRotate: function(index) {
			if (this.delay > 0 && (this.autoRotate === true || this.startAutoPlay)) {
				this.timerId = setTimeout(function() {
					if (this.autoRotate === true && !this.isEnabledAutoPlayOnCarousel) {
						if (this.isDeviceSupportTouch) {
							this.showSlide(index + 1);
						} else if (!this.isHoverOnCarousel) {
							this.showSlide(index + 1);
						}
					} else if (this.autoRotate === true && this.isEnabledAutoPlayOnCarousel && this.startAutoPlay) {
						this.showSlide(index + 1);
					} else if (this.autoRotate === false && this.isEnabledAutoPlayOnCarousel && this.startAutoPlay) {
						this.showSlide(index + 1);
					}
				}.bind(this), this.delay);
			}
		},

		trackNavigation: function(navDirect) {
			Cog.fireEvent("carousel", analyticsDef.CLICK.CAROUSEL_CLICK, {
				query: navDirect,
				componentPosition: this.componentPosition
			});
		},

		trackImageClick: function(e) {
			Cog.fireEvent("image", analyticsDef.CLICK.IMAGE_CLICK, {
				altText: $(e.target).attr("alt"),
				componentPosition: this.componentPosition
			});
		}
	};

	// Slick Carousel additions
	function SlickCarousel() {}

	SlickCarousel.prototype.init = function() {
		var slideDuration = 400;
		var showSlickSlide = function(nextIndex) {
			clearTimeout(this.timerId);
			if (this.isActive) {
				return;
			}
			this.isActive = true;
			this.up = true;
			if (nextIndex < this.currentIndex) {
				this.up = false;
			}

			this.$slidesList.find(".carousel-slide.is-active").removeClass("is-active");

			if (nextIndex >= this.$slides.length) {
				this.currentIndex = 0;
				nextIndex = 1;
			}
			if (nextIndex < 0) {
				this.currentIndex = this.$slides.length;
				nextIndex = this.$slides.length - 1;
			}

			if (nextIndex < this.currentIndex) {
				this.$slidesList.find(".carousel-slide:last-child").prependTo(this.$slidesList);
				this.$slidesList.css("left", -this.slidOffset);
			}

			this.$slidesList.animate({
				left: "+=" + (this.up ? "-" : "") + this.slidOffset
			}, slideDuration, function() {
				if (nextIndex > this.currentIndex) {
					this.$slidesList.find(".carousel-slide:first-child").appendTo(this.$slidesList);
				}
				this.currentIndex = nextIndex;
				this.$slidesList.css("left","0");
				this.$slidesList.find(".carousel-slide").eq(this.activeListItemIndex).addClass("is-active");
				this.isActive = false;
			}.bind(this));

		};
		var width = 0;
		if (this.$el.is(".carousel-slick--variant-1")) { // three items showing
			width = this.$slidesList.css("width");
			this.slidOffset = parseInt(width, 10) / 3;
			this.$slidesList.css("width", (this.slidOffset * 4) + "px");
			this.activeListItemIndex = 1;
			this.showSlide = showSlickSlide;
			this.$slidesList.find(".carousel-slide:last-child").prependTo(this.$slidesList);
			this.currentIndex = 1;
			$(window).resize($.throttle(throttleTime, function() {
				this.$slidesList.css("width","auto");
				this.init();
			}.bind(this)));
		} else if (this.$el.is(".carousel-slick--variant-2")) { // four items showing
			width = this.$slidesList.css("width");
			this.slidOffset = parseInt(width, 10) / 4;
			this.$slidesList.css("width", (this.slidOffset * 5) + "px");
			this.activeListItemIndex = 0;
			this.showSlide = showSlickSlide;
		} else {
			this.$slides.hide().first().show();
		}
	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;

		new Carousel(scope.$scope, this.external.status);
	};

	Cog.registerComponent({
		name: "carousel",
		api: api,
		selector: ".carousel",
		requires: [
			{
				name: "utils.status",
				apiId: "status"
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
