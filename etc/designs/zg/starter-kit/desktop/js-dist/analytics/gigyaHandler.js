(function($) {
	"use strict";

	var api = {};
	var analyticsUtils;
	var ctConstants;
	var ATTRIBUTES = {
		checked: ":checked",
		name: "name",
		optInOptOut: "optInOptOut"
	};

	var SELECTORS = {
		gigyaError: "gigya-error",
		compositeControl: "gigya-composite-control",
		termsError: "gigya-terms-error",
		input: "input",
		gigyaContainer: "#gigya-container"
	};

	function GigyaHandler() {
		this.bindEvents();
	}

	GigyaHandler.prototype = {
		bindEvents: function() {
			Cog.addListener("gigya.analytics", "submitSucceeded", this.onSubmitSucceeded);
			Cog.addListener("gigya.analytics", "logout", this.onLogout);
			Cog.addListener("gigya.analytics", "newsletterSubmit", this.onNewsletterSubmit);
			Cog.addListener("gigya.analytics", "newsletterStart", this.onNewsletterStart);
			Cog.addListener("gigya.analytics", "formValidationMessages", this.formValidationMessages);
			Cog.addListener("gigya.analytics", "serverErrors", this.serverErrors);
			Cog.addListener("gigya.analytics", "login", this.onLogin);
		},

		onSubmitSucceeded: function(event) {
			var eventData = event.eventData;
			var operation = eventData.response.operation;
			var eventLabel;

			if (operation === "/accounts.login") {
				eventLabel = "Signup";
			} else if (operation === "/accounts.register") {
				eventLabel = "Signup/Registration";

				var screenName = eventData.form;
				var selectedOptIn = [];
				if (typeof eventData.response !== "undefined" && eventData.response.errorCode === 0) {
					$(SELECTORS.gigyaContainer + " " + "#" + screenName).find(SELECTORS.input).each(function(index, item) {
						var nameAttribute = $(item).attr(ATTRIBUTES.name);
						if (nameAttribute) {
							if (nameAttribute.indexOf(ATTRIBUTES.optInOptOut) > -1 && $(item).is(ATTRIBUTES.checked)) {
								selectedOptIn.push(nameAttribute);
							}
						}
					});

					if (selectedOptIn.length > 0) {
						var optIneventLabel = selectedOptIn.join(" | ");
						analyticsUtils.addTrackedEvent(ctConstants.Acquisition, optIneventLabel, ctConstants.conversion, ctConstants.lead, {}, ctConstants.trackEvent);
					}
				}
			}

			if (eventLabel) {
				analyticsUtils.addTrackedEvent(ctConstants.signIns, eventLabel + "/CTA", ctConstants.other, "Lead", {}, ctConstants.trackEvent);
			}
		},

		serverErrors: function(event) {
			analyticsUtils.addTrackedEvent(ctConstants.inputerror, "Error type - Server-Side | " + event.eventData.data, ctConstants.custom, "Error", {}, ctConstants.trackEvent);
		},

		formValidationMessages: function(event) {
			var screenName = event.eventData.data;
			var errorsFieldNames = [];
			$(SELECTORS.gigyaContainer + " " + "#" + screenName).find(SELECTORS.input).each(function(index, item) {
				var nameAttribute = $(item).attr(ATTRIBUTES.name);
				if (nameAttribute) {
					if ($(item).hasClass(SELECTORS.gigyaError) || $(item).closest("." + SELECTORS.compositeControl).hasClass(SELECTORS.termsError)) {
						errorsFieldNames.push(nameAttribute);
					}
				}
			});

			if (errorsFieldNames.length > 0) {
				analyticsUtils.addTrackedEvent(ctConstants.inputerror, "Error type - Input | " + errorsFieldNames.join(" | "), ctConstants.custom, "Error", {}, ctConstants.trackEvent);
			}
		},

		onLogin: function() {
			analyticsUtils.addTrackedEvent(ctConstants.signIns, "Signup/CTA", ctConstants.other, "Lead", {}, ctConstants.trackEvent);
		},

		onLogout: function(event) {
			var pageName = event.eventData;
			analyticsUtils.addTrackedEvent(ctConstants.signOut, pageName, ctConstants.custom, "Interest", {}, ctConstants.trackEvent);
		},

		onNewsletterSubmit: function() {
			analyticsUtils.pushComponent("Dynamic Form", null, null, {
				brandOptin: [digitalData.page.attributes.localBrand]
			});
			analyticsUtils.addTrackedEvent(ctConstants.signupSubmit, "GIGYA | Form Submit | Newsletter Sign Up", ctConstants.engagement, ctConstants.lead, {}, ctConstants.trackEvent);
		},

		onNewsletterStart: function() {
			analyticsUtils.addTrackedEvent(ctConstants.signupStart, "GIGYA | Form Start | Newsletter Sign Up",
				ctConstants.engagement, ctConstants.lead, {}, ctConstants.trackEvent);
		}
	};

	api.init = function() {
		ctConstants = this.external.eventsDefinition.ctConstants;
		analyticsUtils = this.external.utils;

		new GigyaHandler();
	};

	Cog.registerStatic({
		name: "analytics.gigya",
		api: api,
		requires: [{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]
	});
}(Cog.jQuery()));
