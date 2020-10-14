/**
 * Navigation
 */

(function($) {
	"use strict";

	var api = {};
	api.navs = [];

	function Nav($nav) {
		this.$nav = $nav;
		this.bindUIEvents();
	}

	Nav.prototype.bindUIEvents = function() {
		var self = this;

		self.$nav.on("tap click", ".navigation-mobile-menu", function(e) {
			e.preventDefault();
			$(this).next(".navigation-root").toggleClass("is-open");

			$(this).attr("aria-expanded", function(_, attr) {
				if (attr === "false") {
					attr = false;
				}

				return !attr;
			});
		});
		$(".navigation .navigation-item-title .navigation-item-decoration").removeAttr("tabindex");

		if (!self.$nav.is(".navigation-horizontal") ||
			$("html").hasClass("mod-touch")) {
			self.$nav
				.on("tap click", ".has-children > .navigation-item-title >" +
				" .navigation-item-decoration", function(event) {
					event.preventDefault();
					event.stopPropagation();

					var $this = $(this).closest(".has-children"),
						$siblings = $this.siblings(".has-children");

					$siblings.not($this).removeClass("is-open")
						.find(".has-children").removeClass("is-open");
					$this.toggleClass("is-open");
				})
				.on("keydown", ".has-children > .navigation-item-title >" +
				" .navigation-item-decoration", function(event) {
					if (event.which === 13) {
						event.stopPropagation();
						event.preventDefault();
						$(this).trigger("click");
					}
				});

			self.$nav
				.on("click", ".has-children > .navigation-item-title >" +
				".navigation-item-decoration", function(event) {
					event.preventDefault();
					event.stopPropagation();
				});
		} else {
			self.$nav
				.on("mouseenter focusin", ".has-children", function() {
					var $this = $(this);
					$this.addClass("is-open");
				})
				.on("mouseleave", ".has-children", function() {
					$(this).removeClass("is-open");
				})
				.on("focusout", ".has-children", function() {
					var $this = $(this);
					setTimeout(function() {
						if (!$this.is(":focus") && !$this.find(":focus").size()) {
							$this.removeClass("is-open");
						}
					}, 0);
				});
		}
	};

	api.onRegister = function(scope) {
		api.navs.push(new Nav(scope.$scope));
	};

	Cog.registerComponent({
		name: "navigation",
		api: api,
		selector: ".navigation[class*=default-]"
	});

	return api;
}(Cog.jQuery()));
