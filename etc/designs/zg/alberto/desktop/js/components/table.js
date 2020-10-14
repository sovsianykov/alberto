/**
 * Table
 */

(function($) {
	"use strict";

	var api = {};

	function openTableWindow(e) {
		var height = $(window).height() / 2,
			width = $(window).width() / 2,
			link = e.target.href;

		window.open(link, "", "menubar=1,resizable=1,scrollbars=1,width=" + width + ",height=" + height);

		return false;
	}

	api.onRegister = function(scope) {
		var $table = scope.$scope,
			$button;

		$table.find("table tr:even").addClass("even");

		$button = $table.find(".table-button");
		$button.click(openTableWindow);
	};

	Cog.registerComponent({
		name: "table",
		api: api,
		selector: ".table"
	});
})(Cog.jQuery());
