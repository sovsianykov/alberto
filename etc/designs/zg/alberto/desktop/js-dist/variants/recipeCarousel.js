(function($) {
	"use strict";

	var api = {};
	var $window = $(window);
	var throttleTime = 150;
	var animationDuration = 600;
	var breakpoints;
	var analyticsDef;
	var analyticsUtils;
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

	function Carousel($scope) {
		this.isRecipesCarousel = $scope.hasClass("recipeList--as-carousel");

		this.componentPosition = analyticsUtils.getComponentPosition($scope.parent());

		if (this.isRecipesCarousel) {
			this.initRecipeListingCarousel($scope);
		} else {
			this.$carousel = $scope.find("> .component-content");
			this.$wrapper = this.$carousel.find("> .content");
			this.$listingItems = this.$wrapper.find(".reference-recipe-category-carousel-item");
			this.initCarousel();
		}
	}

	Carousel.prototype = {
		initCarousel: function() {
			this.buildAndAppendControls();
			this.initIScroll();
			this.bindEvents();
			this.updateButtonsState();
		},

		initRecipeListingCarousel: function($scope) {
			this.$carousel = $scope.find(".recipeListing-wrapper");
			this.$wrapper = this.$carousel.find(".recipeListing-list");
			this.$listingItems = this.$wrapper.find(".recipeListing-item");

			if ($scope.hasClass("favourite-recipes")) {
				Cog.addListener("recipeListing", "favourites-fetched", function() {
					this.$listingItems = this.$wrapper.find(".recipeListing-item");
					this.initCarousel();
				}.bind(this));
				Cog.addListener("recipeListing", "favourite-removed", function() {
					this.$listingItems = this.$wrapper.find(".recipeListing-item");
					this.refresh();
				}.bind(this));
			} else {
				this.initCarousel();
			}
		},

		bindEvents: function() {
			this.iscroll.on("scrollEnd", function() {
				this.updateButtonsState();
			}.bind(this));

			this.$prevBtn.on("click", function() {
				this.goToNextSlide(-1);
				this.trackNavigation("PREVIOUS");
			}.bind(this));

			this.$nextBtn.on("click", function() {
				this.goToNextSlide(1);
				this.trackNavigation("NEXT");
			}.bind(this));

			$window.on("resize", $.throttle(throttleTime, function() {
				this.refresh();
			}.bind(this)));
		},

		trackNavigation: function(navDirect) {
			Cog.fireEvent("recipeListing", analyticsDef.CLICK.CAROUSEL_CLICK, {
				navDirect: navDirect,
				componentPosition: this.componentPosition
			});
		},

		refresh: function() {
			refreshWrapperWidth(this.$wrapper, this.$listingItems);
			this.iscroll.refresh();
			this.updateButtonsState();

			if (getTotalItemsWidth(this.$listingItems) > this.$carousel[0].getBoundingClientRect().width) {
				this.$controls.removeClass(classes.isHidden);
			} else {
				this.$controls.addClass(classes.isHidden);
			}
		},

		buildAndAppendControls: function() {
			this.$prevBtn = $("<button title='previous' aria-label='scroll to previous' class='previous' />");
			this.$nextBtn = $("<button title='next' aria-label='scroll to next' class='next' />");
			this.$controls = $("<div class='carousel-controls'/>")
				.append(this.$prevBtn, this.$nextBtn)
				.insertAfter(this.$carousel);
		},

		goToNextSlide: function(direction) {
			if (!this.iscroll.isInTransition) {
				this.iscroll.disable();
				this.iscroll.goToPage(this.iscroll.currentPage.pageX + direction, 0,
					animationDuration);
				setTimeout(function() {
					this.iscroll.enable();
				}.bind(this), animationDuration);
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

		initIScroll: function() {
			this.iscroll = new IScroll(this.$carousel[0], iScrollConfig);
			this.refresh();

			if ($(window).width() <= breakpoints.sizes.mobile[1] &&
					this.iscroll.pages && this.iscroll.pages.length > 0) {
				this.iscroll.goToPage(1, 0, 0);
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
		name: "carousel-iscroll-recipes",
		api: api,
		selector: ".recipeList--as-carousel, .recipe-category-carousel",
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
