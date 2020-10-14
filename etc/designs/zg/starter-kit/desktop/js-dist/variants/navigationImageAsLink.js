(function($) {
	"use strict";

	var api = {};

	function NavigationTiles($navigationTiles) {
		this.$navigationTiles = $navigationTiles;
		this.$item = this.$navigationTiles.find(".navigation-item");

		this.$item.on("click", function() {
			var $link = $(this).find("a").last();
			window.location.href = $link.attr("href");
		});
	}

	api.onRegister = function(scope) {
		new NavigationTiles(scope.$scope);
	};

	Cog.registerComponent({
		name: "navigation-image-as-link",
		api: api,
		selector: ".navigation-image-as-link"
	});
})(Cog.jQuery());