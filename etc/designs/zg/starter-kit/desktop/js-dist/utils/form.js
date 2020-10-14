/**
 * Form type recognising
 */

(function() {
	"use strict";
	var api = {},
		sharedApi = {};

	var CLASSES = {
		DYNAMIC_FORM: "dynamicForm",
		SIGN_UP_FORM: "sign-up-form",
		EMAIL_US_FORM: "email-us-form",
		NEWSLETTER_FORM: "intrnewsletter-form-secure-parameters",
		CUSTOMER_INFORMATION: "customerInformationForm"
	};

	sharedApi.FORM_TYPE = {
		SIGN_UP: "SIGN_UP",
		CONTACT_US: "CONTACT_US",
		B2B: "MICROSITESURVEY",
		NEWSLETTER_SIGNUP: "NEWSLETTER_SIGNUP",
		CUSTOMER_INFORMATION: "CUSTOMER_INFORMATION",
		OTHER: "OTHER"
	};

	sharedApi.determineFormType = function($form) {
		var type = sharedApi.FORM_TYPE.OTHER;
		if (sharedApi.isDynamicForm($form) && $form.hasClass(CLASSES.SIGN_UP_FORM)) {
			type = sharedApi.FORM_TYPE.SIGN_UP;
		} else if (sharedApi.isDynamicForm($form) && $form.hasClass(CLASSES.EMAIL_US_FORM)) {
			type = sharedApi.FORM_TYPE.CONTACT_US;
		} else if (sharedApi.isNewsletterForm($form)) {
			type = sharedApi.FORM_TYPE.NEWSLETTER_SIGNUP;
		} else if (sharedApi.isCustomerInformationForm($form)) {
			type = sharedApi.FORM_TYPE.CUSTOMER_INFORMATION;
		}
		return type;
	};

	sharedApi.isDynamicForm = function($form) {
		return $form.hasClass(CLASSES.DYNAMIC_FORM);
	};

	sharedApi.isCustomerInformationForm = function($form) {
		return $form.hasClass(CLASSES.CUSTOMER_INFORMATION);
	};

	sharedApi.isFormValid = function($form) {
		return $form.find(":invalid").length === 0;
	};

	sharedApi.isNewsletterForm = function($form) {
		return $form.hasClass(CLASSES.NEWSLETTER_FORM);
	};

	sharedApi.isCaptchaValidOrNotExist = function($form) {
		if ($form.find(".g-recaptcha-response").length && typeof grecaptcha !== "undefined") {
			return grecaptcha.getResponse().length !== 0;
		}
		return true;
	};

	sharedApi.getFormName = function($form) {
		return $form.find("form").attr("name") || "Form without name";
	};

	sharedApi.arrayToObject = function(formArray) {
		var resultObject = {};
		for (var i = 0; i < formArray.length; i++) {
			if (resultObject[formArray[i].name]) {
				resultObject[formArray[i].name] += "," + formArray[i].value;
			} else {
				resultObject[formArray[i].name] = formArray[i].value;
			}
		}
		return resultObject;
	};

	Cog.registerStatic({
		name: "utils.form",
		api: api,
		sharedApi: sharedApi
	});
})();
