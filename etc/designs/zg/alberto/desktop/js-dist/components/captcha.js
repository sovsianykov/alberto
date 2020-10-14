(function($) {
	"use strict";

	var api = {};
	var deactivateErrorMsgDelay = 2000;
	var GOOGLE_CAPTCHA_SCRIPT = "<script src=\"https://www.google.com/recaptcha/api.js\"></script>";
	var captchaLoaded = false;

	function Captcha($captcha, captchaProvider) {
		this.captchaProvider = captchaProvider;
		this.$captcha = $captcha;
		this.$brandElement = $("#brand");

		this.initGoogleCaptchaIfConfigured();
		this.initDeepBlueIfConfigured();
	}

	Captcha.prototype = {
		initDeepBlueIfConfigured: function() {
			if (this.captchaProvider.isDeepblueCaptcha() && this.$brandElement.length) {
				var brand = this.$brandElement.val();
				$.get("/sk-eu/services/deepblueCaptcha?brand=" + brand)
				.done(function(data) {
					this.$captcha.html(data);
				}.bind(this))
				.fail(function() {
					this.$captcha.html("Failed to obtain captcha image. Check the brand and public key.");
				}.bind(this));
			}
		},

		initGoogleCaptchaIfConfigured: function() {
			if (this.captchaProvider.isGoogleCaptcha()) {
				this.loadGoogleCaptchaScript();
				this.deactivateErrorMsg(this.$captcha);
			}
		},

		loadGoogleCaptchaScript: function() {
			if (!captchaLoaded) {
				var recaptchaWidgetLanguage = $(".g-recaptcha").attr("data-recaptcha-widget-language");
				if (recaptchaWidgetLanguage) {
					GOOGLE_CAPTCHA_SCRIPT = GOOGLE_CAPTCHA_SCRIPT.replace("api.js", "api.js?hl=" + recaptchaWidgetLanguage);
				}
				$("head").append(GOOGLE_CAPTCHA_SCRIPT);
				captchaLoaded = true;
			}
		},

		deactivateErrorMsg: function($scope) {
			// TODO; replace this with a data-callback attribute
			if (window.grecaptcha && grecaptcha.getResponse && grecaptcha.getResponse() && $scope.find(".error-msg.active").length) {
				$scope.find(".error-msg.active").removeClass("active");
			}
			setTimeout(function() {
				this.deactivateErrorMsg($scope);
			}.bind(this), deactivateErrorMsgDelay);
		}
	};

	api.onRegister = function(element) {
		var captchaProvider = this.external.captchaProvider;
		var $captcha = captchaProvider.getCaptcha(element.$scope);
		var isLazyLoaded = $captcha.data("lazyloaded");
		var load = function() {
			new Captcha($captcha, captchaProvider);
		};

		if (!isLazyLoaded) {
			load();
		} else {
			window.runOnWindowLoad(load);
		}
	};

	Cog.registerComponent({
		name: "captcha",
		api: api,
		selector: ".captcha",
		requires: [
			{
				name: "utils.captchaProvider",
				apiId: "captchaProvider"
			}
		]
	});
})(Cog.jQuery());
