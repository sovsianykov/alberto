(function($) {
	"use strict";

	// This class works as a "App" for Where to Buy page.
	// It centralizes most communication between components or specific overrides.
	function Stores($holder, config) {
		this.$holder = $holder;
		this.config = config;
		this.$form = this.$holder.find(".storelocator-form");
		this.$resultsWrapper = this.$holder.find(".storelocatorResults-wrapper");
		bindAll(this);

		this.resultsOnly(this.buildMap);
		this.resultsOnly(this.buildResults);

		this.resultsOnly(this.bindResultsEvents);
	}

	Stores.prototype = {
		buildResults: function() {
			// check if there's any custom results holder on the screen
			this.$wrap($(".box-store-locator-results .content").eq(0), this.$resultsWrapper);

			// fill and build form elements before making anything
			var $resultsTemplate = this.$holder.find(".list-template");
			return new Results(this.$resultsWrapper, $resultsTemplate, this.$form, this.config);
		},
		bindResultsEvents: function() {
			// refresh map after results service
			Cog.addListener("stores", "results:refresh", this.fn(function(e) {
				this.noResultsCleanUp();
				this.gmaps.refresh(idx(["eventData", "storeList"], e));
			}));

			// select item in map when it's selected on list
			Cog.addListener("stores", "results:select", this.fn(function(e) {
				this.gmaps.select(idx(["eventData", "index"], e), idx(["eventData", "center"], e) !== false);
			}));

			// results length 0 or error
			Cog.addListener("stores", "results:noResults", this.onNoResults);

			Cog.addListener("stores", "notReady", this.notReady);
		},
		resultsOnly: function(fn) {
			if (this.$resultsWrapper.length > 0) {
				fn();
			}
		},
		notReady: function() {
			this.$resultsWrapper.removeClass("ready error").addClass("loading");
		},
		onNoResults: function() {
			// include the BUY IT NOW tab contents.
			if (this.config.importBuyNowTabContentsForZeroResults && this.$resultsWrapper.length === 1) {
				$(".storelocator-no-results-auxillary").remove(); // remove if previous version exists
				var $target = $("<div class='storelocator-no-results-auxillary'></div>").appendTo(this.$resultsWrapper);
				$target.addClass("is-visible");
				this.$resultsWrapper.addClass("ready").removeClass("loading");
			}
		},
		noResultsCleanUp: function() {
			$(".storelocator-no-results-auxillary").remove();
		},
		buildMap: function() {
			if (document.readyState === "complete") {
				this.buildMapImmediate();
			} else if (!this.mapBuildRequested) {
				this.mapBuildRequested = true; // only request map build once
				this.buildMapLazy();
			}
		},
		buildMapLazy: function() {
			var load = function() {
				this.buildMapImmediate();
			}.bind(this);
			window.runOnWindowLoad(load);
		},
		$wrap: function($wrapper, $elm) {
			if ($wrapper.length > 0) {
				$wrapper.append($elm);
			}
		},
		buildMapImmediate: function() {
			// check if there's any custom map holder on the screen
			var $map = $(".box-store-locator-map").eq(0);
			var $template = this.$holder.find(".info-template");

			if (!$map.length) {
				$map = this.$holder.find(".gmaps-holder");
			}

			this.gmaps = new GMaps($map, $template, this.config);

			return $.when(this.gmaps.init())
				.then(this.fn(function() {
					this.gmaps.refresh([]);
				}));
		}
	};

	var GMaps, idx, bindAll, Results, validator;
	var analyticsUtils, eventsDefinition, ctConstants, componentPosition;
	var api = {
		ext: function() {
			GMaps = GMaps || this.external.GMaps;
			idx = idx || this.external.idx;
			Results = Results || this.external.Results;
			validator = validator || this.external.validator;
			bindAll = bindAll || this.external.bindAll;
		},
		onRegister: function(element) {
			this.ext();
			this.analyticsSetup();
			var defaults = {
				importBuyNowTabContentsForZeroResults: true
			};
			var $holder = element.$scope;
			var config = $holder.find("[data-storelocator]").data("storelocator") || {};
			config = $.extend(defaults, config, this.external.storelocatorConfig);
			componentPosition = analyticsUtils.getComponentPosition($holder);
			new Stores($holder, config);
		},
		analyticsSetup: function() {
			analyticsUtils = analyticsUtils || this.external.analyticsUtils;
			eventsDefinition = eventsDefinition || this.external.eventsDefinition;
			ctConstants = ctConstants || this.external.eventsDefinition.ctConstants;
		}
	};

	Cog.registerComponent({
		name: "stores",
		api: api,
		selector: ".stores",
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
			name: "stores.map",
			apiId: "GMaps"
		}, {
			name: "stores.results",
			apiId: "Results"
		}, {
			name: "utils.url",
			apiId: "url"
		}, {
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		}, {
			name: "analytics.utils",
			apiId: "analyticsUtils"
		}]
	});
})(Cog.jQuery());
