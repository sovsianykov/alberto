(function() {
	"use strict";

	var api = {};

	api.init = function() {
	};

	api.onRegister = function(scope) {
		var formElement = scope.$scope;

		/**
		 * We need to prevent default click on button, as it triggers
		 * in-browser form input fields validation (not needed at this time).
		 */
		formElement.find("button.control-tooltip-button").bind("click", function(e) {
			e.preventDefault();
		});
	};

	Cog.registerComponent({
		name: "form.tooltip",
		api: api,
		selector: ".form-element .has-tooltip"
	});
})();
