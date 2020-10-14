(function($) {
	"use strict";

	var api = {};

	function TurnTo() {
		$("body").on("click", "#TT3settingsLink", function() {
			var attemps = 0;
			var selectChecker = setInterval(function() {
				var $select = $("#TTtraWindow").find("select").closest(".valueL");

				if ($select.length) {
					$select.addClass("select-container");
					clearInterval(selectChecker);
				} 
				
				attemps++;
				
				if (attemps === 5) {
					clearInterval(selectChecker);
				}

			}, 300);
		});
	}

	api.onRegister = function() {
		new TurnTo();
	};

	Cog.registerComponent({
		name: "turnto-select",
		api: api,
		selector: ".turnto"
	});
})(Cog.jQuery());