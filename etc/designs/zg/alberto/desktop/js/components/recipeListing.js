(function($) {
	"use strict";

	var api = {};
	var nextRecipes;
	var analyticsDef;
	var ctConstants;
	var analyticsUtils;
	var urlUtils;

	var FAV_RECIPE_TYPE = 2;
	var FAVOURITES_KEY = "FAVOURITES";

	var constants = {
		FILTER_PARAM: "t",
		SORTING_PARAM: "s"
	};

	function RecipeListing($el) {
		this.$componentContent = $el.children().first();
		this.$showMoreBtn = $el.find(".recipeListing-show-more-btn");
		this.$list = this.$componentContent.find(".recipeListing-list");
		this.$links = this.$list.find("a");
		this.itemsToShow = parseInt(this.$componentContent.data("items-to-show"), 10);
		this.getRecipesUrl = this.$showMoreBtn.data("morepath");
		this.$sortDropdown = this.$componentContent.find("#sortOrder");
		this.$filterDropdowns = this.$componentContent.find(".recipeListing-main-filters select");
		this.filters = "";
		this.componentPosition = analyticsUtils.getComponentPosition($el);
		this.favouriteRecipesList = "";
		this.isFavouriteMode = this.$componentContent.hasClass("favourite-recipes");
		this.favouriteRecipesEmptyParsys = $el.find(".favourite-recipes-empty");
		this.questionId = this.$componentContent.data("question-id");
		this.questionId = this.questionId ? this.questionId.toString() : this.questionId;

		this.selectDropdowns();
		if (this.isFavouriteMode) {
			
			if (isGigyaEnabled()) {
				this.fetchFavouritesGigya();
			} else {
				this.fetchFavouritesFromLocalStorage();
			}
		} else if (this.$showMoreBtn.length) {
			this.getRecipesUrl = this.$showMoreBtn.data("morepath");
			this.sorting = this.$sortDropdown.children(":selected").val();
			this.offset = this.itemsToShow;
			this.fetchNextRecipes();
			this.bindUIEvents();
		} else {
			this.bindUIEvents();
		}
	}

	RecipeListing.prototype.buildUrl = function() {
		var url = window.location.href;
		var params = urlUtils.getQueryParams(url, true);
		delete params[constants.FILTER_PARAM];
		delete params[constants.SORTING_PARAM];
		url = urlUtils.removeParameters(url);

		for (var key in params) {
			if (params.hasOwnProperty(key)) {
				url = urlUtils.addOrUpdateQueryParam(url, key, encodeURIComponent(params[key]));
			}
		}
		return url;
	};

	RecipeListing.prototype.updateUrl = function() {
		var url = this.buildUrl();
		if (this.filters) {
			url = urlUtils.addOrUpdateQueryParam(url, constants.FILTER_PARAM, this.filters);
		}
		if (this.sorting) {
			url = urlUtils.addOrUpdateQueryParam(url, constants.SORTING_PARAM, this.sorting);
		}
		this.pushBrowserState(url);
	};

	RecipeListing.prototype.pushBrowserState = function(url) {
		window.history.pushState(url, document.title, url);
	};

	RecipeListing.prototype.selectDropdowns = function() {
		var url = window.location.href;
		var params = urlUtils.getQueryParams(url, true);
		var dropdownFilters = params[constants.FILTER_PARAM];
		var sortingFilter = params[constants.SORTING_PARAM];
		if (dropdownFilters) {
			dropdownFilters = dropdownFilters.split(",");
			this.$filterDropdowns.each(function() {
				$(this).find("option").each(function(optIndex, optionElement) {
					if (dropdownFilters.indexOf(optionElement.value) > -1) {
						$(this).closest("select").val(optionElement.value);
					}
				});
			});
		}
		this.updateFilterValues();
		if (sortingFilter) {
			this.$sortDropdown.val(sortingFilter);
		}
	};

	RecipeListing.prototype.updateFilterValues = function() {
		var selectedFilters = this.$filterDropdowns.children(":selected").toArray();
		this.filters = selectedFilters
			.filter(function(elem) {
				return elem.hasAttribute("value");
			})
			.map(function(elem) {
				return $(elem).val();
			}).join(",");
	};

	RecipeListing.prototype.fetchFavouritesGigya = function() {
		gigya.accounts.getAccountInfo({
			callback: function(response) {
				if (response.errorCode === 0) {
					this.setFavourtiesFromGigya(response);
				}
			}.bind(this)
		});
	};

	RecipeListing.prototype.fetchFavouriteRecipes = function() {
		this.getRecipesUrl = this.$componentContent.data("fetchfavourites");
		this.sorting = this.$sortDropdown.children(":selected").val();
		this.offset = 0;
		this.fetchNextRecipes(this.bindUIEvents.bind(this));
	};

	RecipeListing.prototype.setFavourtiesFromGigya = function(response) {
		var data = response.data;
		var campaigns = data.campaign;
		var questionsList = [];
		if (campaigns) {
			for (var i = 0; i < campaigns.length; i++) {
				var campaign = campaigns[i];
				var questionAnswers = campaign.questionAnswers;
				if (this.questionId && campaign.id === this.questionId) {
					for (var j = 0; j < questionAnswers.length; j++) {
						var questionAnswer = questionAnswers[j];
						if (questionAnswer.questionID === this.questionId) {
							var answersList = questionAnswer.answer;
							for (var k = 0; k < answersList.length; k++) {
								questionsList.push(answersList[k]);
							}
						}
					}
				}
			}
		}

		this.favouriteRecipesList = $.grep(questionsList, function(item) {
			return parseInt((item.Text || "0").match(/w*(\d+)/)[1], 10) === FAV_RECIPE_TYPE;
		}).map(function(fav) {
			return fav.ID;
		}).join(",");
		this.fetchFavouriteRecipes();
	};

	RecipeListing.prototype.fetchFavouritesFromLocalStorage = function() {
		var result;
		var str = window.localStorage.getItem(FAVOURITES_KEY) || "[]";
		try {
			result = JSON.parse(str);
		} catch (e) {
			result = [];
		}

		this.favouriteRecipesList = $.grep(result, function(item) {
			return item.itemGroup === FAV_RECIPE_TYPE;
		}).map(function(fav) {
			return fav.ID;
		}).join(",");

		this.fetchFavouriteRecipes();
	};

	RecipeListing.prototype.bindUIEvents = function() {
		this.$showMoreBtn.on("click", function() {
			this.$list.append(nextRecipes);
			Cog.init(this.$list);
			Cog.fireEvent("recipeListing", analyticsDef.CLICK.LOAD_MORE_CLICK, {
				componentPosition: this.componentPosition
			});
			Cog.fireEvent("kritique", "reloadInlineRatings");
			this.fetchNextRecipes();
		}.bind(this));

		this.$sortDropdown.on("change", function() {
			this.sorting = this.$sortDropdown.children(":selected").val();
			this.updateUrl();
			this.refreshListState();
		}.bind(this));

		this.$filterDropdowns.on("change", function() {
			var selectedFilters = this.$filterDropdowns.children(":selected").toArray();
			this.updateFilterValues();
			this.updateUrl();
			this.refreshListState();
			this.trackFilter(selectedFilters);
		}.bind(this));

		this.$links.on("click", function(e) {
			var $target = $(e.currentTarget);
			var title = $target.attr("title");
			var url = $target.attr("href");

			Cog.fireEvent("recipeListing", analyticsDef.CLICK.LINK_CLICK, {
				componentName: ctConstants.recipeListing,
				recipeTitle: title,
				recipeUrl: url,
				componentPosition: this.componentPosition
			});
		}.bind(this));

		if (this.isFavouriteMode) {
			this.$list.append(nextRecipes);
			Cog.init(this.$list);
			Cog.fireEvent("recipeListing", analyticsDef.CLICK.LOAD_MORE_CLICK, {
				componentPosition: this.componentPosition
			});
			Cog.fireEvent("kritique", "reloadInlineRatings");
			this.bindUnfavouriteEvents();
			Cog.fireEvent("recipeListing", "favourites-fetched");
		}
	};

	RecipeListing.prototype.bindUnfavouriteEvents = function() {
		this.displayedFavourites = [];
		this.$list.find(".recipeListing-item").each(function(i, item) {
			var options = $(item).find("[name=favourite-item]").data("options");
			this.displayedFavourites.push({
				ID: options.itemId,
				$item: item
			});
		}.bind(this));

		Cog.addListener("favourite", "TOGGLE_FAVOURITE", function(ev) {
			var favouriteIndex = _.findIndex(this.displayedFavourites, function(favourite) {
				return favourite.ID === ev.eventData.ID;
			});
			if (favouriteIndex >= 0) {
				this.displayedFavourites[favouriteIndex].$item.remove();
				this.displayedFavourites.splice(favouriteIndex, 1);
				if (this.displayedFavourites.length === 0) {
					this.favouriteRecipesEmptyParsys.removeClass("is-hidden");
					this.$componentContent.addClass("is-hidden");
				} else {
					Cog.fireEvent("recipeListing", "favourite-removed");
				}
			}
		}.bind(this));
	};

	RecipeListing.prototype.trackFilter = function(selectedFilters) {
		var eventLabel = selectedFilters
			.map(function(elem) {
				return $(elem).text();
			}).join(" | ");

		Cog.fireEvent("recipeListing", analyticsDef.CHANGE.FILTER_CHANGE, {
			eventLabel: eventLabel,
			componentPosition: this.componentPosition
		});
	};

	RecipeListing.prototype.fetchNextRecipes = function(callback) {
		var url = this.getRecipesUrl;
		if (this.isFavouriteMode) {
			url += "?recipeId=" + this.favouriteRecipesList;
		} else {
			url += "?o=" + this.offset + "&s=" + this.sorting;
			url += this.filters ? "&t=" + this.filters : "";
		}

		if (!this.isFavouriteMode || this.favouriteRecipesList !== "") {
			$.get(url, function(data) {
				if (!data) {
					nextRecipes = "";
					this.$showMoreBtn.addClass("is-hidden");
				} else {
					nextRecipes = data;
					this.$showMoreBtn.removeClass("is-hidden");
				}

				this.offset += this.itemsToShow;

				if (typeof callback === "function") {
					callback();
				}
			}.bind(this));
		} else {
			this.favouriteRecipesEmptyParsys.removeClass("is-hidden");
			this.$componentContent.addClass("is-hidden");
			if (typeof callback === "function") {
				callback();
			}
		}
	};

	// Set initial state with currently selected filters and sorting
	RecipeListing.prototype.refreshListState = function() {
		this.offset = 0;

		this.fetchNextRecipes(function() {
			this.$list.html(nextRecipes);
			Cog.init(this.$list);
			Cog.fireEvent("kritique", "reloadInlineRatings");

			// Get the next batch of recipes that will be appended on "Show more" click.
			this.fetchNextRecipes();
		}.bind(this));
	};

	function isGigyaEnabled() {
		return typeof gigya !== "undefined";
	}

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		ctConstants = this.external.eventsDefinition.ctConstants;
		analyticsUtils = this.external.utils;
		urlUtils = this.external.urlUtils;

		var isItFavouritesListing = scope.$scope.children().first().hasClass("favourite-recipes");
		var isGigyaLoad = document.getElementById("gigya-js-lazyLoad");
		if (isItFavouritesListing && isGigyaLoad) {
			Cog.addListener("favourite", "LOAD_RECEIPES_AFTER_GIGYA_LOAD", function() {
				new RecipeListing(scope.$scope);
			}.bind(this));
		} else {
			new RecipeListing(scope.$scope);
		}
	};

	Cog.registerComponent({
		name: "recipeListing",
		api: api,
		selector: ".recipeListing",
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
				name: "utils.url",
				apiId: "urlUtils"
			}
		]
	});
})(Cog.jQuery());
