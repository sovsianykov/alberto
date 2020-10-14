(function($) {
	"use strict";

	var api = {};

	function reloadInlineRatings() {
		if (typeof ratingReview !== "undefined" && ratingReview.widget &&
			ratingReview.widget.rrReloadWidget) {
			ratingReview.widget.rrReloadWidget();
		}
	}

	function propagateEventDown(e) {
		$(e.target).find(".tReview").trigger("click");
	}

	api.init = function() {
		Cog.addListener("kritique", "reloadInlineRatings", reloadInlineRatings);
		Cog.addListener("searchResults", "showMore", reloadInlineRatings);
		Cog.addListener("quickView", "openOverlay", reloadInlineRatings);
		$("body").on("click",".kritique .customReview", propagateEventDown);
	};

	Cog.registerStatic({
		name: "utils.kritique",
		api: api
	});
})(Cog.jQuery());
