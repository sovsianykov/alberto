/**
 * Returns captcha object dependent on chosen provider
 */

(function() {
	"use strict";

	var api = {};
	var sharedApi = {
		PROVIDERS: {
			GOOGLE_CAPTCHA: "GOOGLE_CAPTCHA",
			DEEP_BLUE_CAPTCHA: "DEEP_BLUE_CAPTCHA",
			NONE: "NONE"
		}
	};
	var $deepblueCaptchaContainer;
	var $googleCaptchaContainer;

	var activeProvider = sharedApi.PROVIDERS.NONE;

	sharedApi.getCaptcha = function($scope) {
		var captcha;
		if (activeProvider === sharedApi.PROVIDERS.NONE) {
			activeProvider = sharedApi.determineProvider($scope);
		}
		switch (activeProvider) {
			case sharedApi.PROVIDERS.GOOGLE_CAPTCHA:
				captcha = $googleCaptchaContainer;
				break;
			case sharedApi.PROVIDERS.DEEP_BLUE_CAPTCHA:
				captcha = $deepblueCaptchaContainer;
				break;
		}
		return captcha;
	};

	sharedApi.getProvider = function() {
		if (sharedApi.isGoogleCaptcha()) {
			return sharedApi.PROVIDERS.GOOGLE_CAPTCHA;
		} else if (sharedApi.isDeepblueCaptcha()) {
			return sharedApi.PROVIDERS.DEEP_BLUE_CAPTCHA;
		} else {
			return sharedApi.PROVIDERS.NONE;
		}
	};

	sharedApi.determineProvider = function($scope) {
		$deepblueCaptchaContainer = $scope.find(".deepblue-captcha");
		$googleCaptchaContainer = $scope.find(".g-recaptcha");
		return sharedApi.getProvider();
	};

	sharedApi.isGoogleCaptcha = function() {
		return typeof $googleCaptchaContainer !== "undefined" && $googleCaptchaContainer.length;
	};

	sharedApi.isDeepblueCaptcha = function() {
		return typeof $deepblueCaptchaContainer !== "undefined" && $deepblueCaptchaContainer.length;
	};

	Cog.registerStatic({
		name: "utils.captchaProvider",
		api: api,
		sharedApi: sharedApi
	});
})();
