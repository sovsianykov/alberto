/* global JSON */
(function($) {
	"use strict";

	var filtersHandler, compose, ctConstants, analyticsUtils, urlUtils;

	var constants = {
		CATEGORY_PARAM: "category",
		SUBCATEGORY_PARAM: "subcategory",
		ORDER_PARAM: "order",
		ALL_LABEL: "all"
	};

	var attribute = {
		DATA_ITEM_PRIMARYKEY: "data-item-primarykey"
	};

	var classes = {
		IS_HIDDEN: "is-hidden",
		PROMOTILE_ITEM: "promotile-item"
	};

	var selectors = {
		PROMOTILE_CONTAINER: ".promotile-container",
		PROMOTILES: ".promotiles .richText",
		PROMOTILE_NOT_EDIT: ".promotiles:not(.cq-Editable-dom)",
		LISTING_TILES: ".enable-promotiles .listing-items .listing-item",
		N_LISTING_TILE: ".enable-promotiles .listing-items .listing-item:nth-child",
		FILTER_ML_QUIZ: ".quiz-step.current .listingFilters.filter-ml-quiz"
	};

	function filter($holder, data) {
		data = parseData(data);
		var $form = $holder.find(".filter-form");
		var $quantity = $form.find(".filter-quantity").eq(0);
		var $parentSelectWrapper = $form.find(".filter-category");
		var $childSelectWrapper = $form.find(".filter-subcategory");
		var $orderSelectWrapper = $form.find(".filter-order");
		var $parentSelect = $parentSelectWrapper.find("select");
		var $childSelect = $childSelectWrapper.find("select");
		var $orderSelect = $orderSelectWrapper.find("select");
		var $listing = $holder.next(".listing");
		var isMLFilterEnabled = $holder.hasClass("filter-ml-quiz");

		if (!$listing.length) {
			$listing = $holder.next().find(".listing");
		}

		if (!$listing.length) {
			// if there is no listing found as next element, get a first listing on a page
			$listing = $(".listing").first();
		}

		var config = jsonConfig($listing);
		var componentPosition = analyticsUtils.getComponentPosition($holder);
		var listingPosition = analyticsUtils.getComponentPosition($listing);

		updateQuantity(config.itemsCount);

		Cog.addListener("listigFilter", "UPDATE_COUNT_ON_CHECKBOXES_CHANGE", function(ev) {
			if (ev.eventData.listingEmptyClassCount === 1) {
				updateQuantity(0);
			} else {
				var getProductsconfig = jsonConfig($(ev.eventData.data));
				updateQuantity(getProductsconfig.itemsCount);
			}
		});

		function index(arr, fn) {
			return arr.reduceRight(function(a, b, i) {
				return fn(b) ? i : a;
			}, -1);
		}

		function selectChangeCategory($holder, fn) {
			var $select = $holder.find("select");

			$select.on("change", function() {
				if ($childSelect[0].selectedIndex === 0) {
					// if sub category is set to default then submit category change
					filtersHandler.setFilterTags([$childSelect.val(), $parentSelect.val()]);
					updateUrl();
					Cog.fireEvent("checkboxFilters", "clearFilter");

					filtersHandler.trackListingFilters({
						componentName: "Listing Filters",
						componentPosition: componentPosition
					});

					fn($select.val());
				} else {
					// otherwise reset the subcategory and submit
					fn($select.val());
					$childSelect.val("").change(); // reset subcategory
				}
			});
		}

		function selectChangeSubCategory($holder, fn) {
			var $select = $holder.find("select");

			$select.on("change", function() {
				filtersHandler.setFilterTags([$childSelect.val(), $parentSelect.val()]);
				updateUrl();
				Cog.fireEvent("checkboxFilters", "clearFilter");

				filtersHandler.trackListingFilters({
					componentName: "Listing Filters",
					componentPosition: componentPosition
				});

				fn($select.val());
			});
		}

		function selectChangeOrder($holder, fn) {
			var $select = $holder.find("select");

			$select.on("change", function() {
				filtersHandler.setSortingOrder($orderSelect.val());
				fn($select.val());
				updateUrl();
				filtersHandler.trackListingFilters({
					componentName: "Listing Filters",
					componentPosition: componentPosition
				});
			});
		}

		function selectUpdate($holder) {
			var option = document.createElement("option");
			var $select = $holder.find("select");

			return function(data) {
				$select.html("");

				if (data.length === 0 || $select.length === 0) {
					$holder.hide();
					return;
				}

				var frag = document.createDocumentFragment();
				$holder.addClass("active");
				data.forEach(function(val) {
					var opt = option.cloneNode();
					opt.value = val.value;
					opt.innerHTML = val.label;
					frag.appendChild(opt);
				});
				$select[0].appendChild(frag);
				$select[0].value = "";
			};
		}

		function parseData(data) {
			function all() {
				return data
					.reduce(function(a, b) {
						return b.tags && b.tags.constructor === Array ? a.concat(b.tags) : a;
					}, [])
					.filter(function(val, i, arr) {
						return index(arr, function(v) {
							return v.label === val.label && val.value === v.value;
						}) === i;
					});
			}

			return data.map(function(val) {
				return !val.tags ? {label: val.label, value: "", tags: all()} : val;
			});
		}

		function jsonConfig($elm) {
			return JSON.parse($elm.find("script[type='application/json']").eq(0).text());
		}

		function childBasedOnParent(selected) {
			var i = index(data, function(val) {
				return val.value === selected;
			});
			return data[i].tags;
		}

		function ajaxCall() {
			var cache = {};

			return function() {
				var formAction = "";
				if ($parentSelectWrapper.length === 0) {
					formAction = filtersHandler.getGroupedTemplateUrl();
				} else {
					// when Listing Filters Component is not in "Order only" mode, it doesn't support integration
					// with Listing Check Boxes Filters
					formAction = filtersHandler.getTemplateUrl();
				}
				formAction = formAction.replace("{path}", config.path);
				$form.attr("action", formAction);

				if (cache[formAction]) {
					return cache[formAction].promise;
				}

				$quantity.hide();
				$form.addClass("loading");
				return $.ajax($form.attr("action"), {
						method: $form.attr("method") || "get",
						beforeSend: urlUtils.addWcmModeIfNeeded
					})
					.always(function() {
						$form.removeClass("loading");
					})
					.done(function(data) {
						cache[formAction] = {
							data: data,
							promise: $.Deferred().resolve(data)
						};
						return data;
					});
			};
		}

		function updateQuantity(qtd) {
			var qtdText = $quantity.text().replace(/\b\d+\b/, qtd);
			$quantity.text(qtdText);
			$quantity.addClass("active");
			var promocontainer = $(selectors.PROMOTILE_CONTAINER);
			if (promocontainer.length > 0) {
				injectPromoTiles(promocontainer);
			}
		}

		function result(promise) {
			return promise
				.done(function(data) {
					var config = jsonConfig($(data));
					$listing
						.html(config.itemsCount ? data : "")
						.removeClass("initialized");
					Cog.init({$element: $listing})
						.then(function() {
							Cog.fireEvent("listingFilters", "selectChanged");
							Cog.fireEvent("kritique", "reloadInlineRatings");
							updateQuantity(config.itemsCount);
							if (analyticsUtils.isAnalyticsConfigured()) {
								trackProductImpressionChange();
							}
						});
				})
				.fail(function() {
					$listing.html("");
					updateQuantity(0);
				});
		}

		function trackProductImpressionChange() {
			var products = analyticsUtils.fetchVisibleListingItems($listing.not(classes.PROMOTILE_ITEM));
			if (products.length > 0 && isDifferentThanLastImpression(products)) {
				Cog.fireEvent("listing", ctConstants.productImpression, {
					componentName: "Listing",
					componentPosition: listingPosition,
					products: products
				});
			}
		}

		//Below functionality is needed for correct track Impression on Store Locator Listing
		function isDifferentThanLastImpression(products) {
			var productNames = "";

			$.each(products, function() {
				var ean = analyticsUtils.resolveListingProductEan($(this));
				if (allProducts[ean]) {
					productNames += allProducts[ean].shortTitle;
				}
			});

			if (productNames === digitalData.lastTrackedProductImpression) {
				return false;
			} else {
				digitalData.lastTrackedProductImpression = productNames;
				return true;
			}
		}

		function updateFiltersFromUrl() {
			var url = window.location.href;
			var categoryFilter = urlUtils.getQueryParams(url)[constants.CATEGORY_PARAM];
			var subcategoryFilter = urlUtils.getQueryParams(url)[constants.SUBCATEGORY_PARAM];
			var orderFilter = urlUtils.getQueryParams(url)[constants.ORDER_PARAM];

			if (categoryFilter) {
				$parentSelect.val(categoryFilter).change();
			}
			if (subcategoryFilter) {
				$childSelect.val(subcategoryFilter).change();
			}
			if (orderFilter) {
				$orderSelect.val(orderFilter).change();
			}

		}

		function updateUrl() {
			var url = window.location.href;
			var params = urlUtils.getQueryParams(url, true);
			var wcmModeArr = window.location.search.match(/wcmmode=\w*/g);
			var amp;

			delete params[constants.CATEGORY_PARAM];
			delete params[constants.SUBCATEGORY_PARAM];
			delete params[constants.ORDER_PARAM];
			url = urlUtils.removeParameters(url);

			//add all previous params except filter-related
			for (var key in params) {
				if (params.hasOwnProperty(key)) {
					url = urlUtils.addOrUpdateQueryParam(url, key, encodeURIComponent(params[key]));
				}
			}

			if ($parentSelect.val()) {
				url = urlUtils.addOrUpdateQueryParam(url, constants.CATEGORY_PARAM, encodeURIComponent($parentSelect.val()));
			}
			if ($childSelect.val()) {
				url = urlUtils.addOrUpdateQueryParam(url, constants.SUBCATEGORY_PARAM, encodeURIComponent($childSelect.val()));
			}
			if ($orderSelect.val()) {
				url = urlUtils.addOrUpdateQueryParam(url, constants.ORDER_PARAM, encodeURIComponent($orderSelect.val()));
			}
			if (Array.isArray(wcmModeArr)) {
				amp = _.includes(url, "?") ? "&" : "?";
				url = url + amp + wcmModeArr[0];
			}
			window.history.pushState(url, document.title, url);
		}

		function injectPromoTiles(promocontainer) {
			promocontainer.each(function() {
				var listingContainer = $(this);
				var elementsListing = $(this).find(selectors.PROMOTILES);
				$(this).find(selectors.PROMOTILE_NOT_EDIT).addClass(classes.IS_HIDDEN);
				var promotilesEnabled = $(listingContainer).find(tileSelector(1));
				elementsListing.each(function(ele) {
					if (promotilesEnabled) {
						var classList = elementsListing[ele].className;
						var promotileClassRegex = /promotile-slot-[0-9]+/;
						var classListMatch = classList.match(promotileClassRegex);
						var copyElement = promotilesEnabled[0];
						if (classListMatch && copyElement) {
							var tileInjectSlot = ((classListMatch)[0].split("-"))[2];
							var componentContent = elementsListing[ele].innerHTML;
							var itemCount = $(listingContainer).find(selectors.LISTING_TILES).length;
							tileInjectSlot = ((itemCount + ele) > tileInjectSlot) ? (tileInjectSlot) : (itemCount + ele + 1);
							$(listingContainer).find(tileSelector(tileInjectSlot - 1)).after(copyElement.outerHTML);
							$(listingContainer).find(tileSelector(tileInjectSlot)).removeAttr(attribute.DATA_ITEM_PRIMARYKEY).addClass(classes.PROMOTILE_ITEM);
							$(listingContainer).find(tileSelector(tileInjectSlot)).html(componentContent);
						}
					}
				});
				Cog.fireEvent("promotile", "PROMOTILE");
			});
		}

		function tileSelector(position) {
			var findSelector = selectors.N_LISTING_TILE + "(" + position + ")";
			return findSelector;
		}

		function preventDefault(e) {
			e.preventDefault();
		}

		function init() {
			var ajax = ajaxCall();
			var updateChildSelect = selectUpdate($childSelectWrapper);
			var updateParentSelect = selectUpdate($parentSelectWrapper);

			selectChangeCategory($parentSelectWrapper, compose(result, ajax, updateChildSelect, childBasedOnParent));
			selectChangeSubCategory($childSelectWrapper, compose(result, ajax));
			selectChangeOrder($orderSelectWrapper, compose(result, ajax));

			$form.on("submit", compose(result, ajax, preventDefault));

			Cog.addListener("listingCheckBoxesFilter", "filterUpdate", function() {
				$parentSelect.children(":first-child").prop("selected", true);
				$childSelect.children(":first-child").prop("selected", true);
			});

			updateChildSelect(childBasedOnParent(""));
			updateParentSelect(data);
			updateFiltersFromUrl();
		}

		if (!isMLFilterEnabled) {
			init();
		}
	}

	var api = {
		onRegister: function(scope) {
			filtersHandler = filtersHandler || this.external.filters;
			compose = compose || this.external.compose;
			ctConstants = this.external.eventsDefinition.ctConstants;
			analyticsUtils = this.external.utils;
			urlUtils = this.external.urlUtils;

			var $json = scope.$scope.find("script[type='application/json']");
			if ($json.length) {
				var data = JSON.parse($json.text());
				filter(scope.$scope, data);
			}
		}
	};

	Cog.registerComponent({
		name: "listingFilters",
		api: api,
		selector: ".listingFilters",
		requires: [
			{
				name: "utils.filters",
				apiId: "filters"
			},
			{
				name: "utils.compose",
				apiId: "compose"
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
				name: "utils.url",
				apiId: "urlUtils"
			}
		]
	});
})(Cog.jQuery());
