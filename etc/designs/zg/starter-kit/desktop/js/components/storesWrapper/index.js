(function($) {
	"use strict";
	var $htmlBody;
	// This class works as a "App" for Where to Buy page.
	// It centralizes most communication between components or specific overrides.
	function StoresWrapper($holder) {
		this.$holder = $holder;
		bindAll(this);
		this.$scrollHolder = this.$holder.find(".tabs-where-to-buy");
		this.preventScroll = new PreventParentScroll(this.$scrollHolder);

		this.bindEvents();
	}

	StoresWrapper.prototype = {

		bindEvents: function() {
			// listen to formfill to change step when results is activated
			// this will be triggered when step 2 forms are submitted (override
			// by onStep2FormSubmit)
			Cog.addListener("stores", "results:refresh", this.onRefreshResults);

			// results length 0 or error
			Cog.addListener("stores", "results:noResults", this.onNoResults);

			// scrollTo selected element
			Cog.addListener("stores", "results:select", this.onResultItemSelect);

			$(document).ready(this.onPageLoad);

			enquire.register("screen and (max-width: " + breakpoints.mobileMax + "px)", {
				match: this.onResponsive,
				unmatch: this.onResponsive
			});

		},

		onResponsive: function() {
			this.onStateChange({
				eventData: this.state.getState()
			});
		},

		goToStepEventWrapper: function(index) {
			return this.fn(function() {
				this.goToStep(index);
			});
		},

		onRefreshResults: function() {
			this.scrollToBottomOfResults();
		},

		onNoResults: function() {
			this.scrollToTopOfResults();
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
			Cog.fireEvent(Cog.fireEvent("stores", eventsDefinition.LOAD.STORE_LOCATOR, {
				position: componentPosition
			}));
		},

		scrollToTopOfResults: function() {
			if (window.innerWidth > breakpoints.maxMobile) {
				Scroller.goToElement(this.$scrollHolder, this.$holder.find(".storeresults-list"));
			} else {
				Scroller.goToElementMobile($htmlBody, this.$holder.find(".storeresults-list"));
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

	var idx, bindAll, url, PreventParentScroll, Scroller, breakpoints;
	var analyticsUtils, eventsDefinition, ctConstants, componentPosition;

	var api = {
		onRegister: function(scope) {
			bindAll = this.external.bindAll;
			idx = this.external.idx;
			url = this.external.url;
			analyticsUtils = this.external.analyticsUtils;
			eventsDefinition = this.external.eventsDefinition;
			ctConstants = this.external.eventsDefinition.ctConstants;
			componentPosition = analyticsUtils.getComponentPosition(scope.$scope);
			PreventParentScroll = this.external.PreventParentScroll;
			Scroller = this.external.Scroller;
			breakpoints = this.external.breakpoints;
			$htmlBody = $("html, body");

			// override ratio to specific scenario for where to buy.
			this.external.storelocatorConfig.map.ratio = function() {
				var $map = scope.$scope.find(".box-store-locator-map");
				var $controls = scope.$scope.find(".box-store-locator-controls > .component-content");

				return $map.outerHeight() / ($controls.offset().left + $controls.outerWidth()) || 1;
			};
			new StoresWrapper(scope.$scope);
		}
	};

	Cog.registerComponent({
		name: "storesWrapper",
		api: api,
		selector: ".box-stores-holder",
		requires: [{
				name: "utils.bindAll",
				apiId: "bindAll"
			}, {
				name: "utils.breakpoints",
				apiId: "breakpoints"
			}, {
				name: "whereToBuy.scroller",
				apiId: "Scroller"
			}, {
				name: "utils.preventParentScroll",
				apiId: "PreventParentScroll"
			}, {
				name: "utils.idx",
				apiId: "idx"
			}, {
				name: "storelocator.config",
				apiId: "storelocatorConfig"
			}, {
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
			}
		]
	});
})(Cog.jQuery());
