/**
 * Checkbox
 *
 * Usage example (only one checkbox can be checked at a time)
 * (use data-radiogroup value if you need more than one group)
 * <input type="checkbox" role="radio" data-radiogroup="radiogroup" name="foo" value="true">
 * <input type="checkbox" role="radio" data-radiogroup="radiogroup" name="bar" value="true">
 *
 */
(function($) {

	"use strict";

	var api = {};

	api.onRegister = function(scope) {
		var radioButtonSelector = "[type='checkbox'][role='radio']";
		var $button = scope.$scope.find(radioButtonSelector);

		$button.on("click", function(e) {
			var $target = $(e.target);
			var groupName;
			if ($target.is(":checked")) {
				groupName = $target.attr("data-radiogroup");
				$(radioButtonSelector + "[data-radiogroup='" + groupName + "']").prop("checked", false);
				$target.prop("checked", true);
			}
		});
	};

	Cog.registerComponent({
		name: "checkboxItem",
		api: api,
		selector: ".reference-checkbox-item"
	});

}(Cog.jQuery()));
