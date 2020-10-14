/*jshint -W024 */
(function($) {
	"use strict";

	function StoreLocator($holder, config) {
		this.$holder = $holder;
		this.config = config;
		this.$form = this.$holder.find(".storelocator-form");
		this.$resultsWrapper = this.$holder.find(".storelocatorResults-wrapper");
		this.formFill = new FormFill(this.$form);

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);

		this.initValidator();
		this.buildToggleBehaviour();
		this.buildZipCodeAutoFill();
		this.buildProductSizeSelect();
		this.resultsOnly(this.buildMap);
		this.resultsOnly(this.buildResults);
		this.resultsOnly(this.bindResultsEvents);
	}

	StoreLocator.prototype = {
		bindResultsEvents: function() {
			// refresh map after results service
			Cog.addListener("storelocator", "results:refresh", this.fn(function(e) {
				this.noResultsCleanUp();
				this.gmaps.refresh(idx(["eventData", "storeList"], e));
			}));

			// select item in map when it's selected on list
			Cog.addListener("storelocator", "results:select", this.fn(function(e) {
				this.gmaps.select(idx(["eventData", "index"], e), idx(["eventData", "center"], e) !== false);
			}));

			// results length 0 or error
			Cog.addListener("storelocator", "results:noResults", this.onNoResults);

			Cog.addListener("storelocator", "fillForm", this.onFillForm);

			Cog.addListener("storelocator", "submitCurrentIfValid", this.submitCurrentIfValid);

			Cog.addListener("storelocator", "notReady", this.notReady);
		},

		resultsOnly: function(fn) {
			if (this.$resultsWrapper.length > 0) {
				fn();
			}
		},

		submitCurrentIfValid: function() {
			var $currentForm = $(".storelocator-form-wrapper.is-active .storelocator-form");
			var emptyFields;
			var noOptions;
			if ($currentForm.length) {
				noOptions = $currentForm.find("[type=radio]").length < 2;
				emptyFields = $currentForm.find("input[required]")
					.toArray()
					.filter(function(elm) {
						return elm.value === "";
					});
				if (emptyFields.length === 0 && noOptions) {
					$currentForm.find(".storelocator-button").trigger("click");
				}
			}
		},

		onNoResults: function() {
			// include the BUY IT NOW tab contents.
			if (this.config.importBuyNowTabContentsForZeroResults && this.$resultsWrapper.length === 1) {
				$(".storelocator-no-results-auxillary").remove(); // remove if previous version exists
				var $target = $("<div class='storelocator-no-results-auxillary'></div>").appendTo(this.$resultsWrapper);
				var $tab = this.$resultsWrapper.closest(".tabs-content");
				var $buyNowContent = $tab.parent().find(".tabs-content:last").find(".tabContent > .content");

				$target.append($buyNowContent.clone());
				$target.find(".addtobag-btn").on("click", function(e) {
					// map clicks to origin
					e.preventDefault();
					var $eTarget = $(e.target);
					var selector = $eTarget.prop("nodeName") + "." + $eTarget.prop("class").split(" ").join(".");
					$buyNowContent.find(selector).trigger("click");
				});
				$target.addClass("is-visible");
				this.$resultsWrapper.addClass("ready").removeClass("loading");
			}
		},

		noResultsCleanUp: function() {
			$(".storelocator-no-results-auxillary").remove();
		},

		notReady: function() {
			this.$resultsWrapper.removeClass("ready error").addClass("loading");
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
		},

		// insert elm into wrapper if it exists
		$wrap: function($wrapper, $elm) {
			if ($wrapper.length > 0) {
				$wrapper.append($elm);
			}
		},

		buildResults: function() {
			// check if there's any custom results holder on the screen
			this.$wrap($(".box-store-locator-results .content").eq(0), this.$resultsWrapper);

			// fill and build form elements before making anything
			this.formFill.run();

			var $resultsTemplate = this.$holder.find(".list-template");
			return new Results(this.$resultsWrapper, $resultsTemplate, this.$form, this.config);
		},

		onFillForm: function(e) {
			this.formFill.run(idx(["eventData", "urlData"], e));
			this.$form.submit();
		},

		buildToggleBehaviour: function() {
			// only when toggle is available
			var $toggleButton = this.$holder.find(".storelocator-toggle > button");
			if ($toggleButton.length > 0) {
				new Toggle($toggleButton, this.$holder.find(".storelocator-form-wrapper"));
			}
		},

		buildZipCodeAutoFill: function() {
			// auto zip applies for every situation
			return new ZipCodeAutoFill(
				this.$holder.find(".storelocator-input > .icon-gps"),
				this.$holder.find(".storelocator-input > input"),
				this.config
			);
		},

		buildProductSizeSelect: function() {
			var $sizeHolder = this.$form.find(".storelocator-product-size");
			var $productId = this.$form.find("[name='productId']");
			var $sizeField = this.$form.find("[name='productSizeOptions']");
			var $zipCodeField = this.$form.find("[name='postalCode']");
			var $radiusSelect = this.$form.find("[name='radius']");
			var sizesList = ($sizeField.val() || "").split("|");
			var radioList = [];

			sizesList.forEach(function(item) {
				if (!item) {
					return;
				}

				var split = item.split("=");
				var $label = $("<label/>");
				var $text = $("<span/>").text(split[0]);
				var $radio = $("<input type='radio' name='size'/>").val(split[1] || split[0]);
				var $customRadio = $("<span class='custom-radio'/>");

				radioList.push($radio);

				$label.append($radio).append($customRadio).append($text);
				$sizeHolder.append($label);
			});

			$sizeHolder.on("change", function(e) {
				$productId.val(e.target.value);
				this.fireChangeEvent($zipCodeField.val(), $radiusSelect.val());
			}.bind(this));

			$zipCodeField.on("change", function() {
				this.fireChangeEvent($zipCodeField.val(), $radiusSelect.val());
			}.bind(this));

			$radiusSelect.on("change", function() {
				Cog.fireEvent("storeLocator", eventsDefinition.OTHER.STORE_LOCATOR_OPTIONS, {
					label: "Radius change " + $radiusSelect.val(),
					position: componentPosition
				});
				this.fireChangeEvent($zipCodeField.val(), $radiusSelect.val());
			}.bind(this));

			var $selectedSize = $sizeHolder.find("[value='" + $productId.val() + "']");

			if ($selectedSize.length) {
				$selectedSize.prop("checked", true);
			}

			if (radioList.length === 1) {
				radioList[0].prop("checked", true);
			}
		},

		fireChangeEvent: function(zipCode, radius) {
			var productId = this.$form.find(".storelocator-product-size :checked").val();
			if (analyticsUtils.isAnalyticsConfigured()) {
				var selectedVariant = allProducts[productId];
				var label = selectedVariant.shortTitle + " " + selectedVariant.productSize + "|" + zipCode + "|" + radius;

				Cog.fireEvent("storeLocator",
					eventsDefinition.OTHER.STORE_LOCATOR_OPTIONS, {
						label: label,
						position: componentPosition
					});
			}
		},

		initValidator: function() {
			// validator applies for every situation
			validator(this.$form, [
				".storelocator-zipcode-wrapper",
				".storelocator-radius-wrapper",
				".storelocator-product-wrapper"
			]);
		}
	};

	var GMaps, idx, ZipCodeAutoFill, Results, FormFill, Toggle, validator, bindAll;
	var analyticsUtils, eventsDefinition, ctConstants, componentPosition;
	var api = {
		// use init to make dependencies available to this module.
		ext: function() {
			GMaps = GMaps || this.external.GMaps;
			idx = idx || this.external.idx;
			ZipCodeAutoFill = ZipCodeAutoFill || this.external.ZipCodeAutoFill;
			Results = Results || this.external.Results;
			FormFill = FormFill || this.external.FormFill;
			Toggle = Toggle || this.external.Toggle;
			validator = validator || this.external.validator;
			bindAll = bindAll || this.external.bindAll;
		},

		onRegister: function(element) {
			this.ext();
			this.analyticsSetup();
			var defaults = {importBuyNowTabContentsForZeroResults: true};
			var $holder = element.$scope;
			var config = $holder.find("[data-storelocator]").data("storelocator") || {};
			config = $.extend(defaults, config, this.external.config);
			componentPosition = analyticsUtils.getComponentPosition($holder);

			new StoreLocator($holder, config);
		},

		analyticsSetup: function() {
			analyticsUtils = analyticsUtils || this.external.analyticsUtils;
			eventsDefinition = eventsDefinition || this.external.eventsDefinition;
			ctConstants = ctConstants || this.external.eventsDefinition.ctConstants;
		}
	};

	Cog.registerComponent({
		name: "storelocator",
		api: api,
		selector: ".storelocator",
		requires: [{
			name: "utils.validator",
			apiId: "validator"
		},{
			name: "utils.idx",
			apiId: "idx"
		},{
			name: "utils.bindAll",
			apiId: "bindAll"
		},{
			name: "storelocator.map",
			apiId: "GMaps"
		},{
			name: "utils.toggle",
			apiId: "Toggle"
		},{
			name: "storelocator.zipCodeAutoFill",
			apiId: "ZipCodeAutoFill"
		},{
			name: "storelocator.formFill",
			apiId: "FormFill"
		},{
			name: "storelocator.results",
			apiId: "Results"
		},{
			name: "storelocator.config",
			apiId: "config"
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
