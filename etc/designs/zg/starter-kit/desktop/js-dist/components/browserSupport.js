(function($) {
	"use strict";

	var api = {};
	var cookieExpire = 30; //days
	var $body = $("body");

	api.onRegister = function(component) {
		var $el = component.$scope;
		var browsers = $el.children().data("browsers");

		var closeDialog = function() {
			$el.removeClass("is-open");
			$body.removeClass("is-overlay-open");
			Cog.Cookie.create("browsers-accepted", true, cookieExpire);
		};

		if (browsers && bowser.isUnsupportedBrowser(browsers, true, window.navigator.userAgent) && !Cog.Cookie.read("browsers-accepted")) {
			$el.addClass("is-open");
			$body.addClass("is-overlay-open");
		}

		$el.on("click", ".browsersupport-dialog-close", closeDialog);
		$el.on("click", ".btn-primary", function(e) {
			closeDialog();
			e.preventDefault();
		});
	};

	Cog.registerComponent({
		name: "browsersupport",
		api: api,
		selector: ".browsersupport"
	});

})(Cog.jQuery());
