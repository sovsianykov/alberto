/**
 * Country Language Selector
 */

(function($) {
	"use strict";

	var api = {};
	var options = {
		selectors: {
			activeItemLink: ".countrylanguageselector__item__link.is-active",
			componentContent: ">.component-content",
			firstLink: ".countrylanguageselector__item:first-child a",
			hasChildren: ".has-children",
			itemLink: ".countrylanguageselector__item__link",
			mobileMenu: ".countrylanguageselector__mobile-menu",
			root: ".countrylanguageselector__root",
			select: ".countryLanguageSelector--select"
		},
		classes: {
			disabled: "disabled",
			isActive: "is-active",
			isOpen: "is-open",
			select: "countryLanguageSelector--select",
			selectRoot: "countrylanguageselector__select__root"
		}
	};

	function CountrySelector($nav) {
		this.$nav = $nav;
		this.$links = this.$nav.find(options.selectors.itemLink);
		if (this.$nav.hasClass(options.classes.select)) {
			this.covertToSelectBox();
		} else {
			this.bindDefaultUIEvents();
		}
	}

	CountrySelector.prototype.bindDefaultUIEvents = function() {
		var self = this;

		self.$nav
			.on("tap click", options.selectors.mobileMenu, function(e) {
				e.preventDefault();
				$(this).next(options.selectors.root).toggleClass(options.classes.isOpen);

				$(this).attr("aria-expanded", function(_, attr) {
					if (attr === "false") {
						attr = false;
					}
					return !attr;
				});
			});

		self.$nav
			.on("mouseenter focusin", options.selectors.hasChildren, function() {
				var $this = $(this);
				$this.addClass(options.classes.isOpen);
			})
			.on("mouseleave", options.selectors.hasChildren, function() {
				$(this).removeClass(options.classes.isOpen);
			})
			.on("focusout", options.selectors.hasChildren, function() {
				var $this = $(this);
				setTimeout(function() {
					if (!$this.is(":focus") && !$this.find(":focus").size()) {
						$this.removeClass(options.classes.isOpen);
					}
				}, 0);
			})
			.on("click", options.selectors.itemLink, function(event) {
				Cog.fireEvent("countryLanguageSelector", "languageSelector", {
					label: event.target.getAttribute("href").split("/").pop() + " - " + event.target.href
				});
			});
	};

	CountrySelector.prototype.covertToSelectBox = function() {
		// This list can be very long, so convert to semantic HTML select element.
		// this will allow the browser/OS to draw the options outside the browser on desktop
		// and display a system select control on mobile.
		var $div = $("<div />", {
			"class": "controls"
		});
		var $select = $("<select />", {
			"class": options.classes.selectRoot
		});
		$div.append($select);
		this.$links.each(function(i, el) {
			var $el = $(el);
			var $option;

			$option = $("<option />")
				.attr("dir", $el.attr("dir"))
				.attr("lang", $el.attr("lang"))
				.attr("value", $el.attr("href"))
				.text($el.text());

			if ($el.hasClass(options.classes.isActive)) {
				$option.attr("selected", true);
			}
			$select.append($option);
		});
		this.$nav.addClass("countrylanguageselector__select")
			.find(options.selectors.componentContent)
			.append($div);
		if (this.$links.length > 1) {
			// it's an active menu, add event handler
			$select.on("change", function(e) {
				e.preventDefault();
				Cog.fireEvent("countryLanguageSelector", "countrySelector", {
					label: $(this).children("option:selected").text() + " - " + $("html").attr("lang")
				});
				var href = $(e.target).val();
				location.href = href;
			});
		} else {
			// there is only one option, so remove redundant controls
			$div.addClass(options.classes.disabled);
			$select.attr("tabindex", "-1");
		}
	};

	api.onRegister = function(scope) {
		new CountrySelector(scope.$scope);
	};

	Cog.registerComponent({
		name: "countryLanguageSelector",
		api: api,
		selector: ".countryLanguageSelector"
	});

}(Cog.jQuery()));
