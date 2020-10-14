(function($) {
	"use strict";

	var gigya;
	var api = {};

	var CLASSES = {
		container: "gigya-container"
	};

	var FORMS = {
		registerScreen: "gigya-register-form",
		newsLetterScreen: "gigya-subscribe-with-email-form",
		loginScreen: "gigya-login-form"
	};

	var SELECTORS = {
		gigyaContainer: "#gigya-container",
		form: "form[data-screenset-element-id]",
		inputSubmit: "form[data-screenset-element-id] input.gigya-input-submit",
		gigyaLazyLoad: "gigya-js-lazyLoad"
	};

	var ATTRIBUTES = {
		screenElementId: "data-screenset-element-id",
		dataSrc: "data-src",
		dataHomepage: "data-homepage",
		dataScreenSet: "data-screen-set",
		dataStartScreen: "data-start-screen"
	};

	var SCREENS = {
		registerScreen: "gigya-register-screen",
		subscribeNewsLetter: "gigya-subscribe-with-email-screen"
	};

	var load = function() {
		var gigyaLazyLoad = document.getElementById(SELECTORS.gigyaLazyLoad);
		if (gigyaLazyLoad) {
			gigyaLazyLoad.src = gigyaLazyLoad.getAttribute(ATTRIBUTES.dataSrc);
			gigyaLazyLoad.removeAttribute(ATTRIBUTES.dataSrc);
			gigyaLazyLoad.addEventListener("load", function() {
				setTimeout(function() {
					Cog.fireEvent("gigya", "gigya-show-gigya-screen-set");
					Cog.fireEvent("gigya", "gigya-limited-access");
					Cog.fireEvent("gigya", "gigya-register-container");
					Cog.fireEvent("gigya", "gigya-load-favourite");
					Cog.fireEvent("gigya", "gigya-loaded");
					Cog.fireEvent("favourite", "AFTER_GIGYA_JS_LOADED");
					Cog.fireEvent("favourite", "LOAD_RECEIPES_AFTER_GIGYA_LOAD");
				}, 1000);
			});
		}
	};

	function GigyaContainer($el) {
		this.$el = $el;
		this.homepageUrl = this.$el.attr(ATTRIBUTES.dataHomepage);
		this.screenSet = this.$el.attr(ATTRIBUTES.dataScreenSet);
		this.startScreen = this.$el.attr(ATTRIBUTES.dataStartScreen);

		this.showGigyaScreenSet();
		this.bindUIEvents();
	}

	GigyaContainer.prototype = {
		bindUIEvents: function() {
			$(document).on("click", SELECTORS.gigyaContainer + " " + SELECTORS.inputSubmit, function() {
				var currentForm = $(this).closest(SELECTORS.form).attr(ATTRIBUTES.screenElementId);
				setTimeout(function() {
					if ((currentForm === FORMS.registerScreen) || (currentForm === FORMS.newsLetterScreen)) {
						Cog.fireEvent("gigya.analytics", "formValidationMessages", {
							data: currentForm
						});
					}
				}, 100);
			});
		},
		showGigyaScreenSet: function() {
			var redirectURL = document.referrer || this.homepageUrl;

			gigya.accounts.showScreenSet({
				screenSet: this.screenSet,
				startScreen: this.startScreen,
				containerID: CLASSES.container,
				authFlow: "redirect",
				redirectURL: redirectURL,
				redirectMethod: "post",
				onError: this.serverErrorsHandlers.bind(this),
				onAfterSubmit: this.fireAfterSubmitAnalytics.bind(this),
				onAfterScreenLoad: this.fireLoadAnalytics.bind(this)
			});
		},
		serverErrorsHandlers: function(event) {
			if ((event.form === FORMS.registerScreen) || (event.form === FORMS.newsLetterScreen)) {
				Cog.fireEvent("gigya.analytics", "serverErrors", {
					data: event.response.errorMessage
				});
			}
		},

		fireAfterSubmitAnalytics: function(event) {
			if (event.response.errorCode === 0) {
				if (event.form === FORMS.loginScreen) {
					Cog.fireEvent("gigya.analytics", "login");
				} else if (event.form === FORMS.registerScreen) {
					Cog.fireEvent("gigya.analytics", "newsletterSubmit");
					Cog.fireEvent("gigya.analytics", "submitSucceeded", event);
				} else if (event.form === FORMS.newsLetterScreen) {
					Cog.fireEvent("gigya.analytics", "newsletterSubmit");
				}
			}
		},
		fireLoadAnalytics: function(event) {
			// typeof check, so that "Thank You" screen won't trigger the event
			if ((event.currentScreen === SCREENS.registerScreen) || (event.currentScreen === SCREENS.subscribeNewsLetter)) {
				Cog.fireEvent("gigya.analytics", "newsletterStart");
			}
		}
	};

	api.onRegister = function(scope) {
		var gigyaLazyLoadEnabled = document.getElementById(SELECTORS.gigyaLazyLoad);
		if (gigyaLazyLoadEnabled) {
			if ("gigya" in window) {
				gigya = window.gigya;
				new GigyaContainer(scope.$scope);
			} else {
				Cog.addListener("gigya", "gigya-register-container", function() {
					gigya = window.gigya;
					new GigyaContainer(scope.$scope);
				});
			}
		}
	};

	Cog.registerComponent({
		name: "gigya-container",
		api: api,
		selector: "#gigya-container"
	});
	window.runOnWindowLoad(load);

})(Cog.jQuery());
