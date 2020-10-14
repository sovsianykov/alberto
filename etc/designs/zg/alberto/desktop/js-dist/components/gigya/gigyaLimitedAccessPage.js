(function($) {
	"use strict";

	var gigya;
	var status;
	var api = {};

	var CLASSES = {
		secured: "gigya-secured"
	};

	function GigyaLimitedAccessPage($el) {
		this.$el = $el;
		this.accessType = this.$el.attr("data-access");
		this.redirectUtl = this.$el.attr("data-redirect-url");

		this.verifyLogin();
	}

	GigyaLimitedAccessPage.prototype = {
		verifyLogin: function() {
			gigya.accounts.verifyLogin({
				callback: function(result) {
					var accessDenied;

					if (this.accessType === "login-only") {
						accessDenied = !status.isAuthor() && result.status === "FAIL";
					} else if (this.accessType === "guest-only") {
						accessDenied = !(status.isAuthor() || result.status === "FAIL");
					}

					if (accessDenied) {
						window.location.replace(this.redirectUtl);
					} else {
						$("html").removeClass(CLASSES.secured);
					}

				}.bind(this)
			});
		}
	};

	api.onRegister = function(scope) {
		status = this.external.status;
		var gigyaLazyLoadEnabled = document.getElementById("gigya-js-lazyLoad");
		if (gigyaLazyLoadEnabled) {
			if ("gigya" in window) {
				gigya = window.gigya;
				new GigyaLimitedAccessPage(scope.$scope);
			} else {
				Cog.addListener("gigya", "gigya-limited-access", function() {
					gigya = window.gigya;
					new GigyaLimitedAccessPage(scope.$scope);
				});
			}
		}
	};

	Cog.registerComponent({
		name: "gigya-limited-access-page",
		api: api,
		selector: "#gigya-limited-access-page",
		requires: [{
			name: "utils.status",
			apiId: "status"
		}]
	});

})(Cog.jQuery());
