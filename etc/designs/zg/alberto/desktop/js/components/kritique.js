(function($) {
	"use strict";

	var api = {};
	var eventsDefinition;
	var analyticsUtils;
	var globalEventsAttached;
	var isRrRendererTriggered;
	var classes = {
		closeWidget: ".closeButton",
		customReview: "customReview",
		modalContainer: ".rr-modalWidowcontent rr-Form",
		formSubmission: "form.rr-submission-form input.rr-button",
		markHelpful: "a.helpful",
		markUnhelpful: "a.un-helpful",
		postReview: "button.rr-button",
		readReviews: "span.customReview",
		reviewSection: ".tabs-what-customers-think",
		report: "a.report-btn",
		widgetContainer: ".rr-widget-container",
		writeReview: "a.write-review-btn"
	};
	var bazaarvoiceHandler;
	var isIntentLoaded = false;

	function Kritique($component) {
		this.$component = $component;
		this.componentPosition = analyticsUtils.getComponentPosition($component.closest("[data-position]"));
		if (analyticsUtils.isAnalyticsConfigured()) {
			this.setupAnalytics();
		}
		this.init();
	}

	var load = function() {
		var kritiqueLazyLoad = document.getElementById("kritique-lazyLoad");
		if (kritiqueLazyLoad) {
			kritiqueLazyLoad.src = kritiqueLazyLoad.getAttribute("data-src");
			kritiqueLazyLoad.removeAttribute("data-src");
			kritiqueLazyLoad.id = "rr-widget";
			kritiqueLazyLoad.addEventListener("load", function() {
				Cog.fireEvent("kritique", "KRITIQUE_LAZY_LOAD");
			});
		}
	};
	window.runOnWindowLoad(load);

	Kritique.prototype = {
		init: function() {
			var self = this;
			this.$component.on("click", classes.readReviews, function() {
				this.goToReviews();
			}.bind(this));

			var retries = 0;
			var MAX_RETRIES = 10;
			var DELAY_MS = 500;
			function checkWriteButtonisLoaded() {
				var $writeReviewButton = document.querySelector(classes.writeReview);
				if (!isIntentLoaded && $writeReviewButton) {
					self.loadReviewIfIntentIsReview($writeReviewButton);
					isIntentLoaded = true;
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
		},
		goToReviews: function() {
			clearTimeout(this.scrollToReviews); // ignore multiple click events
			var reviewSection = document.querySelector(classes.reviewSection);
			if (reviewSection && reviewSection.scrollIntoView) {
				this.scrollToReviews = setTimeout(function() {
					reviewSection.scrollIntoView({behavior: "smooth", block: "start"});
				}, 100);
			}
		},
		setupAnalytics: function() {
			this.productName = this.getProductOrRecipeName();
			this.helpfulHandler();
			this.readReviewsHandler();
			this.reportHandler();
			this.writeReviewHandler();
			this.reviewHandler();

			if (!globalEventsAttached) {
				this.widgetCloseHandler();
				this.formSubmissionHandler();
				globalEventsAttached = true;
			}
		},

		formSubmissionHandler: function() {
			$(document).on("click", classes.formSubmission, function() {
				Cog.fireEvent("kritique", eventsDefinition.SUBMIT.KRITIQUE_FORM, {
					position: this.componentPosition,
					label: this.productName
				});
			}.bind(this));
		},

		helpfulHandler: function() {
			this.$component.on("click", classes.markHelpful, function() {
				Cog.fireEvent("kritique", eventsDefinition.CLICK.KRITIQUE_HELPFUL, {
					position: this.componentPosition,
					label: this.productName,
					helpful: true
				});
			}.bind(this));

			this.$component.on("click", classes.markUnhelpful, function() {
				Cog.fireEvent("kritique", eventsDefinition.CLICK.KRITIQUE_UNHELPFUL, {
					position: this.componentPosition,
					label: this.productName,
					helpful: false
				});
			}.bind(this));
		},

		readReviewsHandler: function() {
			this.$component.on("click", classes.readReviews, function(event) {
				var $target = $(event.target);
				//safe check preventing from double event firing
				if ($target.hasClass(classes.customReview)) {
					Cog.fireEvent("kritique", eventsDefinition.CLICK.KRITIQUE_READ_REVIEWS, {
						position: this.componentPosition,
						label: this.productName
					});
				}
			}.bind(this));
		},

		reportHandler: function() {
			this.$component.on("click", classes.report, function() {
				Cog.fireEvent("kritique", eventsDefinition.CLICK.KRITIQUE_REPORT, {
					position: this.componentPosition,
					label: this.productName
				});
			}.bind(this));
		},

		widgetCloseHandler: function() {
			$(document).on("click", classes.closeWidget, function() {
				Cog.fireEvent("kritique", eventsDefinition.CLICK.KRITIQUE_WIDGET_CLOSE, {
					position: this.componentPosition,
					label: this.productName
				});
			}.bind(this));
		},

		writeReviewHandler: function() {
			this.$component.on("click", classes.writeReview, function() {
				Cog.fireEvent("kritique", eventsDefinition.CLICK.KRITIQUE_WRITE_REVIEW, {
					position: this.componentPosition,
					label: this.productName
				});
			}.bind(this));
		},

		reviewHandler: function() {
			if (!isRrRendererTriggered) {
				if (typeof ratingReview.events === "undefined") {
					ratingReview.events = {};
				}
				ratingReview.events.rrRender = function() {
					Cog.fireEvent("kritique", eventsDefinition.OTHER.KRITIQUE_RENDERER, {
						position: this.componentPosition,
						label: this.productName
					});
				}.bind(this);
				isRrRendererTriggered = true;
			}
		},

		getProductOrRecipeName: function() {
			var id = this.$component.find(classes.widgetContainer).attr("data-identifier-value");
			var product = allProducts[id];
			var result = document.title;
			if (product) {
				result = product.shortTitle;
			}
			return result;
		},

		loadReviewIfIntentIsReview: function($writeReviewButton) {
			$writeReviewButton.click();
			Cog.fireEvent("kritique", eventsDefinition.LOAD.PDP_PAGE_LOAD, {
				position: this.componentPosition,
				label: this.productName
			});
			
		}
	};

	api.onRegister = function(scope) {
		eventsDefinition = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		bazaarvoiceHandler = this.external.bazaarvoiceHandler;

		if ("ratingReview" in window) {
			new Kritique(scope.$scope);
		} else {
			Cog.addListener("kritique", "KRITIQUE_LAZY_LOAD", function() {
				new Kritique(scope.$scope);
			});
		}
	};

	Cog.registerComponent({
		name: "kritique",
		api: api,
		selector: ".kritique",
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
