(function() {
	"use strict";

	var api = {
		onRegister: function(scope) {
			this.external.validator(scope.$scope.find("form"), [
				".form-element .component-content",
				".reference-recaptcha .component-content",
				".reference-datepicker .component-content"
			]);
		}
	};

	Cog.registerComponent({
		name: "form-validation",
		api: api,
		selector: ".form",
		requires: [{
			name: "utils.validator",
			apiId: "validator"
		}]
	});
}());
