(function($) {
	"use strict";

	var api = {};
	var viewModes = {
		grid: "grid",
		list: "list"
	};
	var url = window.location.href;
	var cache = {};
	var isCookieqActive;
	var quickViewAdded = false;
	var keys = {
		esc: 27
	};
	var $body = $("body");
	var analyticsDef;
	var analyticsUtils;
	var objectFit;

	function SearchResults($el, focusTrap) {
		this.$el = $el;
		this.searchResultsPage = 2;
		this.resultsType = $el.data("itemtype") || "";
		this.componentPosition = analyticsUtils.getComponentPosition($el);
		this.$componentContent = $el.children(".component-content");
		this.$gridButton = $el.find(".switchToGridButton");
		this.$listButton = $el.find(".switchToListButton");
		this.$sortOrder = $el.find(".sortOrder");
		this.$showMoreButton = $el.find(".searchResults-more");
		this.$searchResultsContents = $el.find(".searchResults-section-contents");
		this.$productItems = $el.find(".item-product");
		this.$searchItems = $el.find(".searchResults-item");
		this.$quickViewButtons = $el.find(".quickview-btn");
		this.$articleLinks = $el.find(".item-article a");
		this.$productLinks = $el.find(".item-product a");
		this.$ctaLinks = $el.find(".view-all a");
		this.isQuizMode = $el.find(".quiz-component").length > 0;
		this.focusTrap = focusTrap.focusTrap;
		isCookieqActive = this.$componentContent.data("cookieq") &&
			this.$componentContent.data("cookieq").active;
		this.bindUIEvents();
		this.setInitialState();
		objectFit.polyfill(this.$el, ".item-article .searchResults-icon a, .item-recipe .searchResults-icon a");
	}

	SearchResults.prototype = {
		bindUIEvents: function() {
			this.$gridButton.on("click", function() {
				this.$componentContent.addClass("display-grid").removeClass("display-list");
				updateCookie(viewModes.grid);
			}.bind(this));

			this.$listButton.on("click", function() {
				this.$componentContent.addClass("display-list").removeClass("display-grid");
				updateCookie(viewModes.list);
			}.bind(this));

			this.$sortOrder.on("change", function() {
				var url = window.location.href.replace(/#+$/, "");
				var sortType = this.$sortOrder.val();
				analyticsUtils.pushComponent("Search results",
						analyticsUtils.getComponentPosition(this.$el),
						analyticsDef.ctConstants.engagement,
						analyticsDef.ctConstants.interest);
				analyticsUtils.addTrackedEvent(analyticsDef.ctConstants.filter,
						sortType,
						analyticsDef.ctConstants.engagement,
						analyticsDef.ctConstants.interest);
				window.location.href = api.external.url.addOrUpdateQueryParam(url, "s",
					sortType);
			}.bind(this));

			this.$showMoreButton.on("click", function(event) {
				var url = $(event.target).data("morepath") + window.location.search + "&p=" + this.searchResultsPage;
				this.searchResultsPage += 1;
				$.get(url, function(data) {
					var $quickViewButtons, $data;
					if (data) {
						$data = $(data).appendTo(this.$searchResultsContents);
						Cog.init({$element: $(data)});
						Cog.fireEvent("searchResults", "showMore");
						this.checkEndOfSearchResults();
						$quickViewButtons = $data.find(".quickview-btn");
						this.bindQuickViewActions($quickViewButtons);

						if (this.resultsType === analyticsDef.ctConstants.product) {
							this.trackImpression($data);
						}

						Cog.fireEvent("favourite", "ADD_ICON_FOR_DYNAMIC_LOADED_ITEMS", {
							$element: this.$searchResultsContents
						});
					}
				}.bind(this));

				Cog.fireEvent("showMoreButton", analyticsDef.CLICK.LOAD_MORE_CLICK, {
					eventLabel: this.resultsType.toUpperCase() || this.$showMoreButton.text(),
					componentName: analyticsDef.ctConstants.searchResults,
					componentPosition: this.componentPosition
				});
			}.bind(this));

			this.bindAnalytics();
			this.bindQuickViewActions(this.$quickViewButtons);
		},

		bindAnalytics: function() {
			analyticsUtils.trackLinks(this.$articleLinks, {
				componentName: analyticsDef.ctConstants.searchResults,
				componentPosition: this.componentPosition,
				type: analyticsDef.ctConstants.article
			});
			analyticsUtils.trackLinks(this.$productLinks, {
				componentName: analyticsDef.ctConstants.searchResults,
				componentPosition: this.componentPosition,
				type: analyticsDef.ctConstants.product
			});
			analyticsUtils.trackLinks(this.$ctaLinks, {
				componentName: analyticsDef.ctConstants.searchResults,
				componentPosition: this.componentPosition,
				type: analyticsDef.ctConstants.cta
			});

			if (this.$productItems && this.$productItems.length > 0 && !this.isQuizMode) {
				this.trackImpression(this.$productItems);
			}
		},

		bindQuickViewActions: function(quickViewButtons) {
			$.each(quickViewButtons, function(i, button) {
				var $button = $(button);
				$button.on("click", function() {
					var snippetPath = $button.data("quickviewsnippetpath");

					if (!quickViewAdded) {
						this.initQuickView();
					}

					this.$container = $body.find(".quickview-container");
					this.$wrapper = this.$container.find(".quickview-wrapper");
					this.$content = this.$container.find(".quickview-content");

					this.getData(snippetPath);
					this.$activeQuickViewButton = $button;
				}.bind(this));
			}.bind(this));

			$body.on("keydown", function(event) {
				if (event.keyCode === keys.esc) {
					this.closeOverlay();
				}
			}.bind(this));
		},

		checkEndOfSearchResults: function() {
			var $endOfSearchResults = this.$el.find(".searchResults-last-page");

			if ($endOfSearchResults.length) {
				$endOfSearchResults.remove();
				this.$showMoreButton.hide();
			}
		},

		setInitialState: function() {
			var viewMode = Cog.Cookie.read("searchResultsView");
			var initSortType = api.external.url.getQueryParams(url).s;
			this.$componentContent.addClass("display-grid");

			if (!viewMode && !isCookieqActive) {
				Cog.Cookie.create("searchResultsView", viewModes.grid);
			} else if (viewMode === viewModes.list) {
				this.$componentContent.removeClass("display-grid").addClass("display-list");
			}

			if (initSortType) {
				this.$sortOrder.val(initSortType);
			}

			if (!this.$searchItems.length) {
				$body.addClass("no-results");
			}

			this.$componentContent.removeClass("is-hidden");
		},

		initQuickView: function() {
			var $quickViewHtml = $("<div class=\"quickview-container\">" +
				"<button class=\"quickview-close\">X</button>" +
				"<div class=\"quickview-wrapper\">" +
				"<div class=\"quickview-content\"/>" +
				"<div/>" +
				"<div/>");
			var backgroundHtml = "<div class='quickview-background'/>";

			$quickViewHtml.find(".quickview-close").on("click", function() {
				this.closeOverlay();
			}.bind(this));
			if ($body.find(".quickview-container").length === 0) {
				$body.append(backgroundHtml).append($quickViewHtml);
			}
			quickViewAdded = true;
		},

		getData: function(snippetPath) {
			if (typeof cache[snippetPath] === "undefined") {
				$.get(snippetPath, function(data) {
					if (typeof data !== "undefined") {
						cache[snippetPath] = $(data).find(".snippetContent").get(0).innerHTML;
						this.openOverlay(snippetPath);
					}
				}.bind(this));
			} else {
				this.openOverlay(snippetPath);
			}
		},

		openOverlay: function(snippetPath) {
			this.$content.html(cache[snippetPath]);
			Cog.init(this.$content);
			this.focusTrap(this.$container);

			this.$container.addClass("is-active");
			$("html").addClass("overlay-open");
		},

		closeOverlay: function() {
			if (typeof this.$container !== "undefined" && typeof this.$activeQuickViewButton !== "undefined") {
				$("html").removeClass("overlay-open");
				$body.removeClass("has-open-quickView");
				this.$container.removeClass("is-active");
				this.$activeQuickViewButton.focus();
			}
		},

		trackImpression: function($products) {
			Cog.fireEvent("listing", analyticsDef.ctConstants.productImpression, {
				componentName: analyticsDef.ctConstants.searchResults,
				componentPosition: this.componentPosition,
				products: $products
			});
		}
	};

	function updateCookie(value) {
		if (isCookieqActive) {
			return;
		}

		var savedViewMode = Cog.Cookie.read("searchResultsView");

		if (savedViewMode) {
			Cog.Cookie.erase("searchResultsView");
		}
		Cog.Cookie.create("searchResultsView", value);
	}

	api.onRegister = function(element) {
		var $el = element.$scope;
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		objectFit = this.external.objectFit;
		new SearchResults($el, this.external.focusTrap);
	};

	Cog.registerComponent({
		name: "searchResults",
		api: api,
		selector: ".searchResults",
		requires: [
			{
				name: "utils.focusTrap",
				apiId: "focusTrap"
			},
			{
				name: "utils.url",
				apiId: "url"
			},
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			},
			{
				name: "utils.objectFit",
				apiId: "objectFit"
			}
		]
	});
})(Cog.jQuery());
