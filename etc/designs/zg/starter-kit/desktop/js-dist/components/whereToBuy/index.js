(function($) {
	"use strict";

	var steps = {
		categorySelection: 1,
		productSelection: 2,
		results: 3
	};

	var keys = {
		category: "cat",
		subcategory: "sub",
		ean: "ean"
	};

	var KEYS = {
		enter: 13,
		esc: 27
	};

	var $htmlBody;

	var focusTabSelectors = {
		stepIndicatorEditButton: ".box-store-locator-step-indicator .where-to-buy-edit",
		tabsWhereToBuyEditButton: ".tabs-where-to-buy .where-to-buy-edit",
		productWrapperEditButton: ".storelocator-product-wrapper .where-to-buy-edit"
	};

	// This class works as a "App" for Where to Buy page.
	// It centralizes most communication between components or specific overrides.
	function WhereToBuy($holder) {
		this.$holder = $holder;

		bindAll(this);

		this.$filterForm = this.$holder.find(".filter-form");
		this.$selectCategory = this.$holder.find(".filter-category select");
		this.$filterSubcategory = this.$holder.find(".filter-subcategory");
		this.$subcategorySelect = this.$filterSubcategory.find("select");
		this.$editButton = this.$holder.find(".where-to-buy-edit");
		this.$step1Label = getLabel(this.$holder, ".store-locator-step-1-label");
		this.toggle = new StorelocatorToggle(this.$holder);
		this.$scrollHolder = this.$holder.find(".box-store-locator-steps");
		this.preventScroll = new PreventParentScroll(this.$scrollHolder);
		this.resultProduct = new ResultProduct(
			this.$holder.find(".box-store-locator-step-3 .storelocator-form"),
			this.$holder.find(".box-store-locator-step-3 .buyitnow")
		);
		this.pathParams = url.getQueryParams(location.search.substring(1));
		this.$editButton.attr("tabindex", "0").attr("role", "button");
		this.$resultIntro = this.$holder.find(".storeresults-intro");

		this.bindEvents();
		this.initState();
		this.handlePathParams();
		this.replaceFormSubmit();
		this.tabFocusEvents();
	}

	function getLabel($scope, selector) {
		// find element, set original text as data attribute and return
		var $el = $scope.find(selector);
		return $el.data("o-text", $el.text());
	}

	WhereToBuy.prototype = {
		tabFocusEvents: function() {
			$(document).on("keydown", focusTabSelectors.stepIndicatorEditButton + "," + focusTabSelectors.tabsWhereToBuyEditButton + "," + focusTabSelectors.productWrapperEditButton, function(event) {
				if (event.keyCode === KEYS.enter) {
					$(this).trigger("click");
				}
			});
		},

		handlePathParams: function() {
			if (this.pathParams[keys.ean]) {
				Cog.addListener("listingFilters", "selectChanged", this.findProductByEan, {disposable: true});

				if (this.pathParams[keys.category] && this.pathParams[keys.subcategory]) {
					filters.setFilterTags([this.pathParams[keys.category], this.pathParams[keys.subcategory]]);
				}

				this.$filterForm.trigger("submit");
				this.goToStep(steps.productSelection);
			} else {
				this.goToStep(steps.categorySelection);
			}
		},

		openToggle: function($eanInput) {
			var $formWrapper = $eanInput.closest(".storelocator-form-wrapper");
			var $button = $formWrapper.prev().find(".storelocator-toggle button");

			$formWrapper.addClass("is-active");
			Cog.fireEvent("toggle", "open", {
				$holder: $button,
				$target: $formWrapper
			});

			if (window.innerWidth > breakpoints.maxMobile) {
				Scroller.goToElement(this.$scrollHolder, $formWrapper);
			} else {
				Scroller.goToElementMobile($htmlBody, $formWrapper.prev());
			}
		},

		findProductByEan: function() {
			var $variantEanInput = this.$holder.find(".storelocator-product-size input[value=" + this.pathParams[keys.ean] + "]");
			var $parentEanInput = this.$holder.find(".storelocator-form > input[value=" + this.pathParams[keys.ean] + "]");

			if ($variantEanInput.length > 0) {
				this.openToggle($variantEanInput);
				$variantEanInput.prop("checked", true).change();
			} else if ($parentEanInput.length > 0) {
				this.openToggle($parentEanInput);
			}
		},

		bindEvents: function() {
			// listen to formfill to change step when results is activated
			// this will be triggered when step 2 forms are submitted (override
			// by onStep2FormSubmit)
			Cog.addListener("formFill", "dataFromURL", this.goToStepEventWrapper(steps.results));

			// go back to first step and remove url params when user clicks "edit"
			this.$editButton.on("click", this.onEditButtonClick);

			// listen to tab change and update state obj
			Cog.addListener("tab", "change", this.onTabChange);

			// listen to state to update steps
			Cog.addListener("whereToBuy", "state:subscribe", this.onStateChange);

			// select first item by default on results list / map
			Cog.addListener("storelocator", "results:refresh", this.onRefreshResults);

			// results length 0 or error
			Cog.addListener("storelocator", "results:noResults", this.onNoResults);

			// scrollTo selected element
			Cog.addListener("storelocator", "results:select", this.onResultItemSelect);

			// check listingFilters events to make the show/hide behaviour
			Cog.addListener("listingFilters", "selectChanged", this.onFilterChange);

			// move form elements outside of the holder
			Cog.addListener("listingFilters", "selectChanged", this.toggle.moveElements);

			$(document).ready(this.onPageLoad);

			enquire.register("screen and (max-width: " + breakpoints.mobileMax + "px)", {
				match: this.onResponsive,
				unmatch: this.onResponsive
			});

			//goto 3rd step
			Cog.addListener("whereToBuy", "goto:step3", this.gotoStep3);
		},

		onResponsive: function() {
			this.onStateChange({eventData: this.state.getState()});
		},

		initState: function() {
			this.state = SimpleState.create("whereToBuy", {
				type: "IDLE", // possible values: NAV, TAB_NAV, SELECT_RESULTS
				step: steps.categorySelection,
				results: {
					tabIndex: 0,
					selectedIndex: null
				}
			});
		},

		goToStepEventWrapper: function(index) {
			return this.fn(function() {
				this.goToStep(index);
			});
		},

		goToStep: function(index, subCategoryText) {
			Cog.fireEvent("whereToBuy", "state:dispatch", {
				type: "NAV",
				step: index,
				subCategoryText: subCategoryText
			});
		},

		replaceFormSubmit: function() {
			// needs to be a selector here as forms are created dynamically
			this.$holder
				.on("submit", ".box-store-locator-step-2 .storelocator-form", this.onStep2FormSubmit);
		},

		onEditButtonClick: function(e) {
			var $parent = $(e.target).parent();
			var wcmModeArr = document.location.search.match(/wcmmode=\w*/g);
			var wcmModeQS = Array.isArray(wcmModeArr) ? "?" + wcmModeArr[0] : "";
			history.pushState("", document.title, url.removeParameters(document.location.href) + wcmModeQS);
			// parent tag has this class to choose the category.
			if ($parent.hasClass("storelocator-product")) {
				(this.goToStepEventWrapper(steps.productSelection))();
			} else {
				(this.goToStepEventWrapper(steps.categorySelection))();
			}
			Cog.fireEvent("storeLocator", eventsDefinition.CLICK.STORE_LOCATOR_CTA, {
				label: "Edit",
				position: componentPosition
			});
		},

		gotoStep3: function(data) {
			data = data.eventData;
			if (data.ean) {
				var $input = this.$holder.find(".storelocator-product-size input[value=" + data.ean + "]");
				$input = ($input.length === 0) ? this.$holder.find(".storelocator-form > input[value=" + data.ean + "]") : $input;
				if ($input.length > 0) {
					(this.goToStepEventWrapper(steps.productSelection))();
					setTimeout(function() {
						this.openToggle($input);
					}.bind(this), 500);
				}
			}
		},

		onRefreshResults: function() {
			if (idx(["results", "selectedIndex"], this.state.getState()) === null) {
				Cog.fireEvent("whereToBuy", "state:dispatch", {
					type: "SELECT_RESULTS",
					results: {
						selectedIndex: 0
					}
				});
			}
			this.scrollToBottomOfResults();
		},

		onNoResults: function() {
			this.scrollToTopOfResults();
		},

		onStep2FormSubmit: function(e) {
			if ($(".buyitnow .pricespider").length > 0) {
				PriceSpider.rebind();
			}
			if (e.isDefaultPrevented()) {
				return;
			}

			var $form = $(e.currentTarget);
			// get parent from toggle as it will always move element to its parent
			var $parent = idx(["$holder"], this.toggle.get($form.parent()[0])) || $form;

			this.resultProduct.update({
				$image: $parent.find("img").eq(0).clone(),
				$rating: $parent.find(".ratingsandreviews"),
				$edit: this.$editButton.clone(true),
				title: $parent.find(".richText").eq(0).text(),
				selectedSize: $form.find("input:checked").parent().text(),
				$smartbutton: $parent.find(".buyitnow")
			});

			Cog.fireEvent("storelocator", "fillForm", {
				urlData: $form.serialize()
			});
			Cog.fireEvent("storeLocator", eventsDefinition.SUBMIT.STORE_LOCATOR, {
				zipCode: $form.find("[name='postalCode']").val(),
				position: componentPosition
			});

			e.preventDefault();
		},

		onTabChange: function(e) {
			var isChild = this.$holder.find(idx(["eventData", "container"], e)).length > 0;
			if (isChild) {
				Cog.fireEvent("whereToBuy", "state:dispatch", {
					type: "TAB_NAV",
					results: {
						tabIndex: idx(["eventData", "index"], e) || 0
					}
				});
			}
		},

		onStateChange: function(e) {
			if (idx(["eventData", "type"], e) !== "NAV") {
				return;
			}

			var step = idx(["eventData", "step"], e);

			if (step === steps.categorySelection) {
				this.$editButton.hide();
				this.$step1Label.text(this.$step1Label.data("o-text"));
				this.$selectCategory[0].selectedIndex = 0;
				this.$filterSubcategory.hide();
				this.preventScroll.disable();
				Cog.fireEvent("storelocator.map", "reset");
				Cog.fireEvent("whereToBuy", "state:dispatch", {
					type: "SELECT_RESULTS",
					results: {
						selectedIndex: null
					}
				});
			} else {
				this.$editButton.show();
				if (e.eventData && e.eventData.subCategoryText) {
					this.$step1Label.text(e.eventData.subCategoryText);
				}
				if (breakpoints.overMobile) {
					this.preventScroll.enable();
				} else {
					this.preventScroll.disable();
				}
			}
		},

		onFilterChange: function() {
			var category = this.$selectCategory.val();
			var subcategory = this.$subcategorySelect.val();
			var subCategoryText = this.$subcategorySelect.find("option:selected").text();

			if (category === "") {
				this.$filterSubcategory.hide();
				return;
			}

			if (subcategory === "" && this.$subcategorySelect.find("option").length > 1) {
				this.$filterSubcategory.show();
				return;
			}

			this.goToStep(steps.productSelection, subCategoryText);
		},

		onResultItemSelect: function(e) {
			var $mapPopup = this.$holder.find(".storeresults-info-wrapper");

			if (idx(["eventData", "scroll"], e)) {
				Scroller.go(this.$scrollHolder, ".storeresults-list > li", idx(["eventData", "index"], e));
			}
			if ($mapPopup) {
				analyticsUtils.trackLinks($mapPopup, {
					componentName: ctConstants.storeLocator,
					componentPosition: componentPosition,
					category: ctConstants.engagement,
					subcategory: ctConstants.read
				});
			}
		},

		onPageLoad: function() {
			Cog.fireEvent(Cog.fireEvent("storeLocator", eventsDefinition.LOAD.STORE_LOCATOR, {
				position: componentPosition
			}));
		},

		scrollToTopOfResults: function() {
			if (window.innerWidth > breakpoints.maxMobile) {
				Scroller.goToElement(this.$scrollHolder, this.$resultIntro);
			} else {
				Scroller.goToElementMobile($htmlBody, this.$resultIntro);
			}
		},

		scrollToBottomOfResults: function() {
			if (window.innerWidth > breakpoints.maxMobile) {
				// don't mess with scrolling on mobile.
				// the new results will start where the more-button was
				Scroller.goToElement(this.$scrollHolder, this.$holder.find(".storeresults-list li:last-child"));
			}
		}

	};

	var idx, bindAll, filters, url, StorelocatorToggle, SimpleState, PreventParentScroll, Scroller, breakpoints, ResultProduct;
	var analyticsUtils, eventsDefinition, ctConstants, componentPosition;

	var api = {
		onRegister: function(scope) {
			SimpleState = this.external.SimpleState;
			bindAll = this.external.bindAll;
			idx = this.external.idx;
			filters = this.external.filters;
			url = this.external.url;
			analyticsUtils = this.external.analyticsUtils;
			eventsDefinition = this.external.eventsDefinition;
			ctConstants = this.external.eventsDefinition.ctConstants;
			componentPosition = analyticsUtils.getComponentPosition(scope.$scope);
			StorelocatorToggle = this.external.StorelocatorToggle;
			PreventParentScroll = this.external.PreventParentScroll;
			Scroller = this.external.Scroller;
			breakpoints = this.external.breakpoints;
			ResultProduct = this.external.ResultProduct;
			$htmlBody = $("html, body");

			// override ratio to specific scenario for where to buy.
			this.external.storelocatorConfig.map.ratio = function() {
				var $map = scope.$scope.find(".box-store-locator-map");
				var $controls = scope.$scope.find(".box-store-locator-controls > .component-content");

				return $map.outerHeight() / ($controls.offset().left + $controls.outerWidth()) || 1;
			};

			new WhereToBuy(scope.$scope);
		}
	};

	Cog.registerComponent({
		name: "whereToBuy",
		api: api,
		selector: ".box-store-locator-holder",
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		},{
			name: "utils.breakpoints",
			apiId: "breakpoints"
		},{
			name: "whereToBuy.storelocatorToggle",
			apiId: "StorelocatorToggle"
		},{
			name: "whereToBuy.resultProduct",
			apiId: "ResultProduct"
		},{
			name: "whereToBuy.scroller",
			apiId: "Scroller"
		},{
			name: "utils.simpleState",
			apiId: "SimpleState"
		},{
			name: "utils.preventParentScroll",
			apiId: "PreventParentScroll"
		},{
			name: "utils.idx",
			apiId: "idx"
		},{
			name: "storelocator.config",
			apiId: "storelocatorConfig"
		},{
			name: "utils.filters",
			apiId: "filters"
		},{
			name: "utils.url",
			apiId: "url"
		},
		{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
		{
			name: "analytics.utils",
			apiId: "analyticsUtils"
		}]
	});
})(Cog.jQuery());
