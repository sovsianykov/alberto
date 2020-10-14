/**
 * Listing analytics elements
 */
(function($) {
	"use strict";

	var api = {};
	var analyticsUtils;
	var analyticsDef;
	var ctConstants;
	var status;
	var questionId;
	var PRODUCT = "product", ARTICLE = "article", CTA = "cta";
	var ITEM_GROUP_PRODUCT = 1;
	var ITEM_GROUP_ARTICLE = 0;

	var fetchedFavourites = [];
	var shouldFetchFavourites = false;

	function Listing($el) {
		this.$el = $el;
		this.$items = this.$el.find(".listing-item");
		this.componentPosition = analyticsUtils.getComponentPosition($el);
		this.listingType = this.$el.data("itemtype") || "";
		this.$linkContainers = this.$el.find(".component").find("a");
		this.$controls = this.$el.find(".carousel-controls");
		this.carouselImpressionInProgress = false;
		this.isRelatedArticles = this.$el.is(".analytics-related-articles-listing");

		if (status.isPublish() && this.$el.is(".favourite-listing")) {
			shouldFetchFavourites = true;
			Cog.addListener("favourite", "FAVOURITES_FETCHED", function() {
				if (isGigyaEnabled()) {
					this.processGigyaFavourites();
				} else {
					this.processLSFavourites();
				}
			}.bind(this));
			Cog.addListener("favourite", "TOGGLE_FAVOURITE", function(ev) {
				this.removeFavourite(ev.eventData.ID);
			}.bind(this));
		}

		if (!this.$el.is(".listing--product-variants, .listing--snippet")) {
			this.trackLinks(this.listingType);
		}
		this.trackImpression();

		if (this.$el.is(".listing-product-default-view")) {
			this.setTileClicks();
		}
	}

	Listing.prototype = {

		trackImpression: function() {
			if (this.$el.find(".show-more").length) {
				this.trackImpressionOnLoad(this.$items.filter(":visible"));
			} else if (this.$el.hasClass("listing--as-carousel")) {
				this.trackImpressionOnLoad(this.$items.filter(this.isProductVisible));
				this.trackCarouselImpression();
			} else if (this.$el.hasClass("listing-store-locator-product-list")) {
				this.trackImpressionOnLoad(this.$items.filter(":visible"));
			} else if (!this.$el.hasClass("listing--product-variants")) {
				this.trackImpressionOnLoad(this.$items);
			}
		},

		trackImpressionOnLoad: function($products) {
			if (analyticsUtils.isAnalyticsConfigured()) {
				Cog.fireEvent("listing", "READY", {
					$listingProducts: $products
				});
			}
		},

		trackCarouselImpression: function() {
			this.$controls.on("click", function() {
				if (this.carouselImpressionInProgress) {
					clearTimeout(this.carouselImpressionInProgress);
				}
				this.carouselImpressionInProgress = setTimeout(function() {
					if (this.listingType === analyticsDef.ctConstants.product) {
						Cog.fireEvent("listing",
								analyticsDef.ctConstants.productImpression,
								{
									products: this.$items.filter(this.isProductVisible),
									componentPosition: this.componentPosition,
									componentName: analyticsDef.ctConstants.listing
								});
					}
					this.carouselImpressionInProgress = false;
				}.bind(this), 1000);
			}.bind(this));
		},

		trackLinks: function(listingType) {
			switch (listingType) {
				case PRODUCT:
					analyticsUtils.trackLinks(this.$linkContainers, {
						componentName: ctConstants.listing,
						componentPosition: this.componentPosition,
						type: ctConstants.product
					});
					break;
				case ARTICLE:
					analyticsUtils.trackLinks(this.$linkContainers, {
						componentName: ctConstants.listing,
						componentPosition: this.componentPosition,
						type: this.isRelatedArticles ? ctConstants.relatedArticle : ctConstants.article,
						category: this.isRelatedArticles ? ctConstants.custom : undefined
					});
					break;
				case CTA:
					analyticsUtils.trackLinks(this.$linkContainers, {
						componentName: ctConstants.listing,
						componentPosition: this.componentPosition,
						type: ctConstants.cta
					});
					break;
			}
		},

		isProductVisible: function() {
			return !$(this).hasClass("is-hidden");
		},

		setTileClicks: function() {
			this.$el.on("click", ".listing-item .box.last", function(e) {
				var $target = $(e.target);
				var $currentTarget = $(e.currentTarget);
				var $link;
				var href;
				if ($target.closest("a, button", $currentTarget).length === 0) {
					// if the event origin was NOT a link
					$link = $currentTarget.find(".richText-content a[href]:first");
					href = $link.attr("href");
					if ($link.length && href) {
						// if we can find a link with an href
						e.preventDefault();
						$currentTarget.css({"cursor":"wait"});
						location.href = href;
					}
				}
			});
		},

		processGigyaFavourites: function() {
			this.favourites = fetchedFavourites
				.map(function(favourite) {
					return {id: favourite.ID};
				});
			this.processFavourites();
		},

		processLSFavourites: function() {
			this.favourites = fetchedFavourites
				.filter(function(favourite) {
					// itemGroup : 0 -> Article, 1 -> Product
					switch (this.listingType) {
						case PRODUCT:
							return favourite.itemGroup === ITEM_GROUP_PRODUCT;
						case ARTICLE:
							return favourite.itemGroup === ITEM_GROUP_ARTICLE;
						default:
							return false;
					}
				}.bind(this))
				.map(function(favourite) {
					return {id: favourite.ID};
				});
			this.processFavourites();
		},

		processFavourites: function() {
			this.$items.each(function(index, item) {
				var $item = $(item);
				var itemId = this.getItemId($item);
				if (itemId) {
					var favourite = this.getFavouriteById(itemId);
					if (favourite) {
						favourite.$item = $item;
						$item.show();
					} else {
						$item.remove();
					}
				} else {
					$item.remove();
				}
			}.bind(this));
			this.favourites = this.favourites.filter(function(fav) {
				return fav.$item !== undefined;
			});
			if (this.favourites.length === 0) {
				this.showFavouriteEmptyMessage();
			}
		},

		removeFavourite: function(itemId) {
			var favouriteIndex = _.findIndex(this.favourites, function(favourite) {
				return favourite.id === itemId;
			}.bind(this));
			if (favouriteIndex >= 0) {
				this.favourites[favouriteIndex].$item.remove();
				this.favourites.splice(favouriteIndex, 1);
				if (this.favourites.length === 0) {
					this.showFavouriteEmptyMessage();
				}
			}
		},

		getFavouriteById: function(itemId) {
			return _.find(this.favourites, function(favourite) {
				return favourite.id === itemId;
			});
		},

		getItemId: function($item) {
			var $meta = $item.find(".favourite meta");
			var ops = $meta ? $meta.data("options") : {};
			if (ops !== undefined && ops.itemId !== undefined) {
				return ops.itemId;
			} else {
				console.error("Configuration error, item ID missing.");
				return null;
			}
		},

		showFavouriteEmptyMessage: function() {
			this.$el
				.closest(".plp-wrapper, .listing-article-list")
				.removeClass("plp-wrapper")
				.removeClass("listing-article-list");
			this.$el.find(".listing-items").remove();
			this.$el.find(".favourite-list-empty").show();
		}
	};

	function addArticleClickListener($items) {
		var ENTER_CODE = 13;
		if ($items.length !== 0 && $items[0].dataset.itemPrimarykey.indexOf("article") !== -1) {
			$items.each(function() {
				var $item = $(this);
				var $target = $item.find(".content").first();
				$target.attr("tabindex", 0);
				$target.on("keyup", function(e) {
					if (e.keyCode === ENTER_CODE) {
						$target.trigger("click");
					}
				});
			});

			$items.on("click", "a", function(e) {
				onClickArticle(e);
			});
		}
	}

	function isGigyaEnabled() {
		return typeof gigya !== "undefined";
	}

	function fetchFavourites() {
		if (isGigyaEnabled()) {
			fetchFavouritesGigya();
		} else {
			fetchFavouritesLocalStorage();
		}
	}

	function fetchFavouritesGigya() {
		gigya.accounts.getAccountInfo({
			callback: function(response) {
				if (response.errorCode === 0) {
					processGigyaResponse(response);
				}
			}
		});
	}

	function processGigyaResponse(response) {
		var data = response.data;
		var campaigns = data.campaign;
		if (campaigns) {
			for (var i = 0; i < campaigns.length; i++) {
				var campaign = campaigns[i];
				if (questionId && campaign.id === questionId) {
					var questionAnswers = campaign.questionAnswers;
					for (var j = 0; j < questionAnswers.length; j++) {
						var questionAnswer = questionAnswers[j];
						if (questionAnswer.questionID === questionId) {
							fetchedFavourites = questionAnswer.answer;
							Cog.fireEvent("favourite", "FAVOURITES_FETCHED");
							break;
						}
					}
					break;
				}
			}
		}
	}

	function fetchFavouritesLocalStorage() {
		var fetchedString = window.localStorage.getItem("FAVOURITES") || "[]";
		fetchedFavourites = JSON.parse(fetchedString);
		Cog.fireEvent("favourite", "FAVOURITES_FETCHED");
	}

	function setQuestionId($items) {
		var $favourite = $items.first().find(".favourite");
		questionId = $favourite.find("meta").data("question-id");
		questionId = questionId ? questionId.toString() : questionId;
	}

	function onClickArticle(e) {
		Cog.fireEvent("listingAnalytics", analyticsDef.CLICK.ARTICLE_LINK, {
			query: e.currentTarget.href
		});
	}

	api.onRegister = function(scope) {
		var $listing = scope.$scope;
		var $items = $listing.find(".listing-item");
		setQuestionId($items);
		analyticsDef = this.external.eventsDefinition;
		ctConstants = this.external.eventsDefinition.ctConstants;
		analyticsUtils = this.external.utils;
		status = this.external.status;
		addArticleClickListener($items);
		
		var isItFavouritesListing = scope.$scope.is(".favourite-listing");
		var isGigyaLoad = document.getElementById("gigya-js-lazyLoad");
		if (isItFavouritesListing && isGigyaLoad) {
			Cog.addListener("favourite", "AFTER_GIGYA_JS_LOADED", function() {
				new Listing(scope.$scope);
			}.bind(this));
		} else {
			new Listing(scope.$scope);
		}
	};

	api.init = function() {
		if (shouldFetchFavourites) {
			fetchFavourites();
			shouldFetchFavourites = false;
		}
	};

	Cog.registerComponent({
		name: "listing",
		api: api,
		selector: ".listing",
		requires: [{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
			{
				name: "utils.status",
				apiId: "status"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}]
	});
})(Cog.jQuery());
