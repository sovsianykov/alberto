(function($) {
	"use strict";

	var gigya;
	var api = {};
	var ops = {
		selectors: {
			scope: ".reference-header",
			loginLink: ".gigya-login-link",
			loggedInLinks: ".gigya-logged-in-links",
			logoutLink: ".gigya-logout",
			mobileProfileTitle: ".nav-mobile .gigya-logged-in-links-title",
			desktopProfileTitle: ".header-supplementary .gigya-logged-in-links-title"
		},
		classes: {
			active: "is-active"
		}
	};

	function NavigationGigya($el) {
		this.$el = $el;
		this.$container = $(ops.selectors.scope);
		this.$loginLink = this.$container.find(ops.selectors.loginLink);
		this.$loggedInLinks = this.$container.find(ops.selectors.loggedInLinks);
		this.$mobileProfileTitle = this.$container.find(ops.selectors.mobileProfileTitle);
		this.$desktopProfileTitle = this.$container.find(ops.selectors.desktopProfileTitle);
		this.$desktopProfileTitleParent = this.$desktopProfileTitle.closest("li");

		this.bindUIEvents();

		gigya.accounts.verifyLogin({
			callback: function(result) {
				this.setState(result);
			}.bind(this)
		});
	}

	NavigationGigya.prototype = {
		logout: function() {
			gigya.accounts.logout({
				callback: function() {
					Cog.fireEvent("gigya.analytics", "logout", digitalData.page.pageInfo.destinationURL);
					window.location.reload(true);
				}
			});
		},
		bindUIEvents: function() {
			this.$container.on("click", ops.selectors.logoutLink, function(e) {
				e.preventDefault();
				this.logout();
			}.bind(this));

			// KEYBOARD (tab though menu)
			this.$desktopProfileTitle.on("focus", function() {
				this.$desktopProfileTitleParent.addClass(ops.classes.active);
			}.bind(this));
			this.$desktopProfileTitleParent.on("blur", "a", function() {
				setTimeout(function() {
					if (!this.hasFocus()) {
						this.$desktopProfileTitleParent.removeClass(ops.classes.active);
					}
				}.bind(this), 10);
			}.bind(this));

			// MOUSE USER (mouse hover)
			this.$desktopProfileTitleParent.on("mouseenter", function() {
				this.$desktopProfileTitleParent.addClass(ops.classes.active);
			}.bind(this));
			this.$desktopProfileTitleParent.on("mouseleave", function() {
				this.$desktopProfileTitleParent.removeClass(ops.classes.active);
			}.bind(this));
		},
		setState: function(result) {
			if (result && result.status !== "FAIL") {
				this.showLoggedInMenu();
			} else {
				this.showLoggedOutMenu();
			}
		},
		hasFocus: function() {
			// do any of the child nav elements have focus?
			var active = false;
			this.$desktopProfileTitleParent.find("a").each(function(i, el) {
				if (!active && $(el).is(":focus")) {
					active = true;
					return false;
				}
			});
			return active;
		},
		showLoggedInMenu: function() {
			this.$loggedInLinks.attr("aria-hidden","false");
			this.$loginLink.remove();
			this.$mobileProfileTitle.remove();
		},
		showLoggedOutMenu: function() {
			this.$loginLink.attr("aria-hidden","false");
			this.$loggedInLinks.remove();
		}

	};

	api.onRegister = function(scope) {
		if ("gigya" in window) {
			gigya = window.gigya;
			new NavigationGigya(scope.$scope);
		} else {
			Cog.addListener("gigya", "gigya-loaded", function() {
				gigya = window.gigya;
				new NavigationGigya(scope.$scope);
			});
		}
	};

	Cog.registerComponent({
		name: "navigation-gigya",
		api: api,
		selector: ".navigation-gigya",
		requires: [{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]
	});

})(Cog.jQuery());
