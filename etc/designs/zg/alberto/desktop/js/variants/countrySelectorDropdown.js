(function() {
	"use strict";

	var api = {};

	api.onRegister = function(scope) {
		var $element = scope.$scope;

		$element.on("change", function() {
			window.location.href = this.value;
		});
	};

	Cog.registerComponent({
		name: "country-selector-dropdown",
		api: api,
		selector: ".country-selector-dropdown select[name='country']"
	});
})(Cog.jQuery());
