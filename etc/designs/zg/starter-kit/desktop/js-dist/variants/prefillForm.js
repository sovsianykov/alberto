/**
 * Components - Prefilling sign up form with an email from query string
 */
(function($) {
	"use strict";

	var api = {};
	var formClass = ".form--redirect";
	var emailInput = ":input#email";
	var emailQueryParam = "email";
	var localStorageEmailParam = "newsletter.signup.email";

	api.init = function() {
		var queryStringVal = this.external.querystring.getFromQueryString(emailQueryParam);
		if (localStorage.getItem(localStorageEmailParam) || queryStringVal) {
			$(formClass)
				.find(emailInput)
				.val(queryStringVal ? queryStringVal : localStorage.getItem(localStorageEmailParam));
			// removing email from local storage once its populated on page.
			localStorage.removeItem(localStorageEmailParam);
		}
	};

	Cog.register({
		name: "prefill-form",
		api: api,
		selector: formClass,
		requires: [
			{
				name: "utils.querystring",
				apiId: "querystring"
			}
		]
	});

})(Cog.jQuery());

