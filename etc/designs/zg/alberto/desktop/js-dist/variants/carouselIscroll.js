(function($) {
	"use strict";

	var api = {};
	var $window = $(window);
	var throttleTime = 150;
	var animationDuration = 600;
	var analyticsDef;
	var analyticsUtils;
	var breakpoints;
	var classes = {
		isHidden: "is-hidden"
	};
	var iScrollConfig = {
		snap: true,
		bounce: false,
		eventPassthrough: "ontouchstart" in window,
		useTransition: true,
		mouseWheel: false,
		scrollX: true,
		scrollY: false
	};

	function Carousel($carousel) {
		this.$el = $carousel;
		this.$wrapper = $carousel.find(".listing-items");
		this.$listingItems = this.$wrapper.find(".listing-item");

		this.$wrapper.wrap("<div class='listing-carousel'></div>");
		this.$carousel = $carousel.find(".listing-carousel");

		this.componentPosition = analyticsUtils.getComponentPosition($carousel);

		this.setUpItemsPerSlide();
		this.buildAndAppendControls();
		this.initIScroll();
		this.bindEvents();
		this.updateButtonsState();
	}

	Carousel.prototype = {
		bindEvents: function() {
			this.iscroll.on("scrollEnd", function() {
				this.updateButtonsState();
				this.updateActiveIndicator();
				this.toggleItems();
			}.bind(this));

			this.iscroll.on("scrollStart", function() {
				this.$listingItems.removeClass(classes.isHidden);
			}.bind(this));

			this.$prevBtn.on("click", function() {
				this.trackNavigation("PREVIOUS");
				this.goToNextSlide(-1);
			}.bind(this));

			this.$nextBtn.on("click", function() {
				this.trackNavigation("NEXT");
				this.goToNextSlide(1);
			}.bind(this));

			this.$controls.on("click", "button", function() {
				this.$listingItems.removeClass(classes.isHidden);
			}.bind(this));

			$window.on("resize", $.throttle(throttleTime, function() {
				this.refresh();
			}.bind(this)));

			this.$indicators.on("click", ".indicator", function(event) {
				this.iscroll.goToPage($(event.target).data("slide"), 0, animationDuration);
				this.updateActiveIndicator();
				this.trackNavigation(this.$indicators.find(".indicator.is-active").index() + 1);
			}.bind(this));

			Cog.addListener("tab", "change", function(e) {
				// Refresh carousel when contained within a tab container
				if (e.eventData && this.$carousel.closest(e.eventData.container).length > 0) {
					this.refresh();
				}
			}.bind(this));
		},

		refresh: function() {
			refreshWrapperWidth(this.$wrapper, this.$listingItems);
			this.iscroll.refresh();
			this.updateButtonsState();
			this.refreshIndicators();

			if (getTotalItemsWidth(this.$listingItems) > this.$carousel[0].getBoundingClientRect().width) {
				this.$controls.removeClass(classes.isHidden);
			} else {
				this.$controls.addClass(classes.isHidden);
			}

			this.toggleItems();
		},

		toggleItems: function() {
			var width = this.$carousel[0].getBoundingClientRect().width;
			var windowWidth = $(window).width();

			if (windowWidth > breakpoints.sizes.mobile[1]) {
				_.forEach(this.$listingItems, function(item) {
					var $item = $(item);
					var parentPos = $item.parent().position().left;
					var position = Math.ceil(parentPos + $item.position().left);

					if (position < -1 || position >= width) {
						$item.addClass(classes.isHidden);
					} else {
						$item.removeClass(classes.isHidden);
					}
				});
			} else {
				_.forEach(this.$listingItems, function(item) {
					var $item = $(item);
					var offset = Math.ceil($item.offset().left);
					var itemWidth = item.getBoundingClientRect().width;

					if (offset + itemWidth < 0 || offset >= windowWidth) {
						$item.addClass(classes.isHidden);
					} else {
						$item.removeClass(classes.isHidden);
					}
				});
			}

		},

		buildAndAppendControls: function() {
			this.$prevBtn = $("<button title='previous' aria-label='scroll to previous' class='previous' />");
			this.$nextBtn = $("<button title='next' aria-label='scroll to next' class='next' />");
			this.$indicators = $("<ul class='indicators'/>");
			this.$controls = $("<div class='carousel-controls'/>")
				.append(this.$prevBtn, this.$indicators, this.$nextBtn)
				.appendTo(this.$carousel);
		},

		goToNextSlide: function(direction) {
			if (!this.iscroll.isInTransition) {
				this.iscroll.disable();
				this.iscroll.goToPage(this.iscroll.currentPage.pageX + direction, 0,
					animationDuration);
				setTimeout(function() {
					this.iscroll.enable();
				}.bind(this), animationDuration);
				this.updateActiveIndicator();
			}
		},

		updateButtonsState: function() {
			var pos = [
				{$elm: this.$prevBtn, pos: 0},
				{$elm: this.$nextBtn, pos: this.iscroll.pages.length - 1}
			];

			$.each(pos, function(i, data) {
				if (this.iscroll.currentPage.pageX === data.pos) {
					data.$elm.addClass("disabled");
				} else {
					data.$elm.removeClass("disabled");
				}
			}.bind(this));
		},

		setUpItemsPerSlide: function() {
			var classes = this.$el.attr("class");
			var itemsPerSlide = {
				defaults: {
					mobile: 1,
					tablet: 3,
					desktop: 4
				},
				variants: {
					mobile: classes.match(/listing-cols-(\d)-mobile/),
					tablet: classes.match(/listing-cols-(\d)-tablet/),
					desktop: classes.match(/listing-cols-(\d)(?:\s|$)/)
				}
			};

			// If there are variant classes defining the number of items per slide
			// for specific viewport, use them instead of the defaults.
			this.itemsPerSlide = {
				mobile: itemsPerSlide.variants.mobile ?
					itemsPerSlide.variants.mobile[1] : itemsPerSlide.defaults.mobile,
				tablet: itemsPerSlide.variants.tablet ?
					itemsPerSlide.variants.tablet[1] : itemsPerSlide.defaults.tablet,
				desktop: itemsPerSlide.variants.desktop ?
					itemsPerSlide.variants.desktop[1] : itemsPerSlide.defaults.desktop
			};
		},

		refreshIndicators: function() {
			var indicatorsHTML = "";
			var windowWidth = $(window).width();
			var itemsCount = this.$listingItems.length;
			var slidesCount = Math.ceil(itemsCount / this.itemsPerSlide.mobile);

			if (windowWidth > breakpoints.sizes.notebook[1]) {
				slidesCount = Math.ceil(itemsCount / this.itemsPerSlide.desktop);
			} else if (windowWidth > breakpoints.sizes.mobile[1]) {
				slidesCount = Math.ceil(itemsCount / this.itemsPerSlide.tablet);
			}

			this.$indicators.empty();
			for (var i = 0; i < slidesCount; i++) {
				indicatorsHTML += "<li class='indicator-wrapper'><button data-slide='" + i +
					"' class='indicator' aria-label='slide " + i + "'></button></li>";
			}
			this.$indicators.html(indicatorsHTML);
			this.updateActiveIndicator();
		},

		updateActiveIndicator: function() {
			var activeIndicator = (this.iscroll.currentPage.pageX ? this.iscroll.currentPage.pageX : 0) + 1;

			this.$indicators
				.find(".indicator.is-active")
				.removeClass("is-active");
			this.$indicators
				.find("li:nth-child(" + activeIndicator + ") > .indicator")
				.addClass("is-active");
		},

		trackNavigation: function(navDirect) {
			Cog.fireEvent("carousel", analyticsDef.CLICK.CAROUSEL_CLICK, {
				query: navDirect,
				componentPosition: this.componentPosition
			});
		},

		initIScroll: function() {
			this.iscroll = new IScroll(this.$carousel[0], iScrollConfig);
			this.refresh();

			if ($(window).width() <= breakpoints.sizes.mobile[1]) {
				this.iscroll.goToPage(1, 0, 0);
				this.toggleItems();
				this.updateActiveIndicator();
			}
		}
	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		breakpoints = this.external.breakpoints;

		new Carousel(scope.$scope);
	};

	function getTotalItemsWidth($listingItems) {
		var size = 0;

		$listingItems.each(function(i, elm) {
			size += elm.offsetWidth;
		});

		return size;
	}

	function refreshWrapperWidth($wrapper, $listingItems) {
		$wrapper.css("width", "");
		$listingItems.each(function(i, elm) {
			$(elm)
				.css("width", "")
				.css("width", elm.getBoundingClientRect().width);
		});
		$wrapper.css("width", getTotalItemsWidth($listingItems));
	}

	Cog.registerComponent({
		name: "carousel-iscroll",
		api: api,
		selector: ".listing--as-carousel",
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			},
			{
				name: "utils.breakpoints",
				apiId: "breakpoints"
			}
		]
	});
})(Cog.jQuery());
