/**
 * maxlength -  Given a form element has a maxlength attribute, this shows the user how many chars remain
 * 				this script adds attribute 'data-remaining-length' to the label tag associated with the form element
 * usage example
 * 		maxlength.showRemainingCount({
			$root: this.$el
		});
 *
 */
(function($) {
	"use strict";

	var api = {};
	var sharedApi = {};

	sharedApi.showRemainingCount = function(ops) {
		var $root = ops.$root;
		var LABEL_SELECTOR = ops.LABEL_SELECTOR || "label[for='$id']";
		var MAXLENGTH_SELETOR = ops.MAXLENGTH_SELETOR || "[maxlength]";
		var DATA_ATTR = ops.DATA_ATTR || "data-remaining-length";

		$root.find(MAXLENGTH_SELETOR).each(function() {
			var id = $(this).attr("id");
			var val = $(this).val();
			if (!id) {
				console.log("setup error: form element", $(this).attr("name") ," with no id");
				return;
			}
			var $label = $(this).siblings(LABEL_SELECTOR.replace("$id", id));
			var maxlength = parseInt($(this).attr("maxlength"), 10);
			if ($label.length === 1 && maxlength) {
				$label.attr(DATA_ATTR, maxlength - val.length);
				$(this).on("change, keyup", function() {
					var l = $(this).val().length;
					$label.attr(DATA_ATTR, maxlength - l);
				});
			}
		});
	};

	Cog.registerStatic({
		name: "utils.maxlength",
		api: api,
		sharedApi: sharedApi
	});
})(Cog.jQuery());
