(function($) {
	"use strict";

	var api = {};

	api.init = function(scope) {
		var cookie = Cog.Cookie.read("cookiePolicy");
		api.markup = $(scope);

		if (!cookie && api.markup.length) {
			api.markup.removeClass("collapsed");
			api.markup.find(".cookiePolicy-accept").click(acceptCookie);
		}
	};

	function acceptCookie() {
		api.markup.addClass("collapsed");
		Cog.Cookie.create("cookiePolicy", true, 30);
	}

	Cog.register({
		name: "cookiePolicy",
		api: api,
		selector: ".cookiePolicy"
	});
})(Cog.jQuery());

