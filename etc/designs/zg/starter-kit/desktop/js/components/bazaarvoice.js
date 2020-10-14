(function($) {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;
	var bazaarvoiceHandler;

	function InlineRating($rating) {
		analyticsSetup();

		var targetNode = $rating.find("[data-bv-show=\"rating_summary\"]").get(0);
		var $writeReviewButton = document.getElementsByClassName("bv_button_buttonMinimalist");
		var hasRatingsContainer = $rating.find(".bv_stars_component_container").length ? true : false;
		if (hasRatingsContainer) {
			processRatingStars($rating);
			return;
		}
		var observerOptions = {
			childList: true,
			attributes: false,
			subtree: true
		};
		var observer = new MutationObserver(function(mutationList, observer) {
			mutationList.forEach(function(mutation) {
				if (mutation.addedNodes && $rating.find(".bv_stars_component_container").length) {
					processRatingStars($rating);
					observer.disconnect();
				}
			});
		});
		if (targetNode) {
			observer.observe(targetNode, observerOptions);
		}
		var retries = 0;
		var MAX_RETRIES = 5;
		var DELAY_MS = 1000;

		function checkWriteButtonisLoaded() {
			if ($writeReviewButton.length) {
				loadReviewIfIntentIsReview($writeReviewButton);
			} else if (retries < MAX_RETRIES) {
				retries++;
				setTimeout(function() {
					checkWriteButtonisLoaded();
				}, DELAY_MS);
			}
		}
		if (bazaarvoiceHandler.isIntentReview()) {
			checkWriteButtonisLoaded();
		}
	}

	function analyticsSetup() {
		Cog.fireEvent("bazaarvoice", analyticsDef.OTHER.BAZAARVOICE);
	}

	function processRatingStars($rating) {
		// input;  <div><svg><path style="fill: url(#foo)"/><linearGradient id="foo"/></svg>...</div>
		// output; <div><svg><path style="fill: url(#foo-123123)"/><linearGradient id="foo-123123"/></svg>...</div>
		// the IDs need to be unique on the page, so the SVG will
		// be able to find the gradients
		var updateBackgroundID = function(i, el) {
			var $el = $(el);
			var $linearGradient = $el.find("linearGradient[id]");
			var id = $linearGradient.attr("id");
			var newId = id + "-" + (+ (new Date()));
			var $updateEls = $el.children("[style*='#" + id + "']");

			$linearGradient.attr("id", newId);
			$updateEls.each(function(i, el) {
				$(el).attr("style","fill: url(#" + newId + ") !important");
			});
		};
		var $svgs = $rating.find("svg");
		$svgs.each(updateBackgroundID);
		return $rating;
	}

	function loadReviewIfIntentIsReview($writeReviewButton) {
		$writeReviewButton[0].click();
	}

	var load = function() {
		var bazaarvoiceLazyLoad = document.getElementById("bazaarvoice-lazyLoad");
		if (bazaarvoiceLazyLoad) {
			bazaarvoiceLazyLoad.setAttribute("src", bazaarvoiceLazyLoad.getAttribute("data-src"));
			bazaarvoiceLazyLoad.removeAttribute("data-src");
			bazaarvoiceLazyLoad.addEventListener("load", function() {
				Cog.fireEvent("bazaarvoice", "BV_LAZY_LOAD");
			});
		}
	};
	window.runOnWindowLoad(load);

	api.onRegister = function(scope) {
		var $rating = scope.$scope;
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		bazaarvoiceHandler = this.external.bazaarvoiceHandler;

		if (typeof $BV !== "undefined") {
			new InlineRating($rating);
		} else {
			Cog.addListener("bazaarvoice", "BV_LAZY_LOAD", function() {
				new InlineRating($rating);
			});
		}
	};

	Cog.registerComponent({
		name: "bazaarvoice",
		api: api,
		selector: ".ratingsandreviews",
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
				name: "analytics.bazaarvoiceHandler",
				apiId: "bazaarvoiceHandler"
			}
		]
	});
})(Cog.jQuery());
