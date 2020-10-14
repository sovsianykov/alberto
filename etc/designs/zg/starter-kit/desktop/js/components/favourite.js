/**
 * Favourite
 */
(function($, _) {
	"use strict";

	var api = {};
	var KEY = "FAVOURITES";
	var questionIds = [];
	var questionId;
	var favourites = [];
	if (!isGigyaEnabled()) {
		var str = window.localStorage.getItem(KEY) || "[]";
		try {
			favourites = JSON.parse(str);
		} catch (e) {
			favourites = [];
		}
	}

	function isSupported() {
		if (isGigyaEnabled()) {
			return true;
		} else {
			// test if localStorage works, not just if it exists
			try {
				var test;
				var testVal = "[]";
				window.localStorage.setItem(KEY + "_TEST", testVal);
				test = window.localStorage.getItem(KEY + "_TEST");
				window.localStorage.removeItem(KEY + "_TEST");
				return (test === testVal && !window.CQ);
			} catch (e) {
				return false;
			}
		}
	}

	function isGigyaEnabled() {
		return typeof gigya !== "undefined";
	}

	function readResponse(response) {
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
							favourites = questionAnswer.answer;
							favouriteAfterLogin();
							Cog.fireEvent("favourite", "FAVOURITES_UPDATED");
							break;
						}
					}
					break;
				}
			}
		}
	}

	function getUpdatedGigyaFavourites(callback) {
		gigya.accounts.getAccountInfo({
			callback: function(response) {
				if (response.errorCode === 0) {
					var data = response.data;
					data.campaign.forEach(function(questionsItem) {
						if (questionsItem.id === questionId) {
							favourites = questionsItem.questionAnswers[0].answer;
							callback();
						}
					});
				}
			}
		});
	}

	function favouriteAfterLogin() {
		var favItemFromSession = sessionStorage.getItem("beforeLoginFavItem") || "{}";
		favItemFromSession = JSON.parse(favItemFromSession);

		if (favItemFromSession && favItemFromSession.id) {
			// it gives a object if favItemFromSession item already in favourites
			var favItem = _.find(favourites, {
				ID: favItemFromSession.id
			});
			// if favItemFromSession is not present in favourites then only pushing to favourites 
			// and updating gigya favourites to avoid duplicate results
			if (!favItem) {
				favourites.push({
					Text: "Item group: " + favItemFromSession.groupId,
					ID: favItemFromSession.id
				});
				gigya.accounts.setAccountInfo({
					data: {
						"campaign": [{
							"id": favItemFromSession.questionId,
							"questionAnswers": [{
								"questionText": "Favourites " + favItemFromSession.questionId,
								"answer": favourites,
								"questionID": favItemFromSession.questionId
							}]
						}]
					}
				});
			}
			sessionStorage.removeItem("beforeLoginFavItem");
		}
	}

	function initializeFavouritesFromGigya() {
		gigya.accounts.getAccountInfo({
			callback: function(response) {
				if (response.errorCode === 0) {
					readResponse(response);
				}
			}
		});
	}

	function FavouriteItem($el) {
		this.$el = $el;
		this.$data = this.$el.find("meta");
		this.ops = this.$data.data("options") || {};
		this.loginPageUrl = this.$data.data("login-page-url");
		this.$listParent = this.$el.closest(".listing-item, .recipeListing-item, .searchResults-item");
		this.$detailsParent = this.$el.closest(".box-meta-details");
		this.ops.ctaType = (this.$listParent.length && this.$detailsParent.length === 0) ? "icon" : "button";

		this.addButton();
		this.bindUIEvents();

		Cog.addListener("favourite", "ADD_ICON_FOR_DYNAMIC_LOADED_ITEMS", function(ev) {
			this.addFavIconToDynamicLoadedItems(ev);
		}.bind(this));

		Cog.addListener("favourite", "REPAINT_FAVOURITE", this.setButtonState.bind(this));
	}

	FavouriteItem.prototype.addButton = function() {
		if (this.ops.ctaType === "icon" && this.$listParent.length && this.$listParent.find(".image .analytics-image-tracking").length) {
			this.$button = $("<button />")
				.insertBefore(this.$listParent.find(".image .analytics-image-tracking"));
		} else {
			this.$button = $("<button />")
				.insertBefore(this.$data);
		}
		this.$button
			.addClass(this.ops.ctaType)
			.addClass("favourite-icon")
			.attr("data-label-add", this.ops.labelAdd)
			.attr("data-label-remove", this.ops.labelRemove);
		this.setButtonState();
		// update button state if any favourite has been updated on the page
		// this is to support multiple icons/buttons with the same id (e.g. when in a variant listing)
		Cog.addListener("favourite", "FAVOURITES_UPDATED", function() {
			this.setButtonState();
		}.bind(this));
	};

	FavouriteItem.prototype.bindUIEvents = function() {
		this.$button.on("click", function(e) {
			if (isGigyaEnabled()) {
				var url = this.loginPageUrl;
				var favItemDetails = {
					groupId: this.ops.itemGroup,
					id: this.ops.itemId,
					questionId: questionId
				};
				gigya.accounts.verifyLogin({
					callback: function(result) {
						if (result.status === "FAIL" && url) {
							clickedFavBeforeLogin(favItemDetails);
							window.location.replace(url);
						}
					}
				});
			}
			e.stopPropagation();
			e.preventDefault();
			Cog.fireEvent("favourite", "TOGGLE_FAVOURITE", {
				ID: this.ops.itemId,
				itemPath: this.ops.itemPath,
				action: (this.isFavourite() ? "Remove" : "Add")
			});
			this.toggleState();
		}.bind(this));
	};

	function clickedFavBeforeLogin(favItemDetails) {
		sessionStorage.setItem("beforeLoginFavItem", JSON.stringify(favItemDetails));
	}

	FavouriteItem.prototype.toggleState = function() {
		if (this.isFavourite()) {
			if (isGigyaEnabled()) {
				getUpdatedGigyaFavourites(function() {
					_.remove(favourites, {ID: this.ops.itemId});
					this.save();
				}.bind(this));
			} else {
				_.remove(favourites, {ID: this.ops.itemId});
				this.save();
			}
		} else {
			this.addFavourite();
		}
	};

	FavouriteItem.prototype.setButtonState = function() {
		this.$button
			.attr("data-favourite", this.isFavourite())
			.attr("title", (this.isFavourite() ? this.ops.labelRemove : this.ops.labelAdd));
	};

	FavouriteItem.prototype.isFavourite = function() {
		return !!(_.find(favourites, {ID: this.ops.itemId}));
	};

	FavouriteItem.prototype.addFavourite = function() {
		if (this.ops.itemId) {
			if (isGigyaEnabled()) {
				getUpdatedGigyaFavourites(function() {
					favourites.push({
						Text: "Item group: " + this.ops.itemGroup,
						ID: this.ops.itemId
					});
					this.save();
				}.bind(this));
			} else {
				favourites.push({
					ID: this.ops.itemId,
					itemGroup: this.ops.itemGroup,
					timeStamp: Date.now()
				});
				this.save();
			}
		} else {
			console.error("Configuration error, item ID missing");
		}
	};

	FavouriteItem.prototype.save = function() {
		if (isGigyaEnabled()) {
			gigya.accounts.setAccountInfo({data: {
					"campaign": [{
						"id": questionId,
						"questionAnswers": [{
							"questionText": "Favourites " + questionId,
							"answer": favourites,
							"questionID": questionId
						}]
					}]
				}});
		} else {
			var json;
			try {
				json = JSON.stringify(favourites);
			} catch (e) {// couldn't parse json to string
				json = "[]";
			}
			window.localStorage.setItem(KEY, json);
		}
		Cog.fireEvent("favourite", "FAVOURITES_UPDATED");
	};

	FavouriteItem.prototype.addFavIconToDynamicLoadedItems = function(ev) {
		Cog.init({$element: ev.eventData.$element});
	};

	function afterGigyaLoadFetchFavourites(scope) {
		if (isGigyaEnabled()) {
			var $favourite = scope.$scope;
			questionId = $favourite.find("meta").data("question-id");
			$favourite.addClass("gigya-is-lazyloaded");
			questionId = questionId ? questionId.toString() : questionId;
			if (questionId && !questionIds.includes(questionId)) {
				initializeFavouritesFromGigya();
				questionIds.push(questionId);
			}
		}
	}

	api.onRegister = function(scope) {
		var isGigyaLoad = document.getElementById("gigya-js-lazyLoad");
		if (isGigyaLoad) {
			Cog.addListener("gigya", "gigya-load-favourite", function() {
				afterGigyaLoadFetchFavourites(scope);
			});
		} else {
			afterGigyaLoadFetchFavourites(scope);
		}
		new FavouriteItem(scope.$scope);
	};

	if (isSupported()) {
		Cog.registerComponent({
			name: "favourite",
			api: api,
			selector: ".favourite",
			requires: []
		});
	}

})(Cog.jQuery(), window._);
