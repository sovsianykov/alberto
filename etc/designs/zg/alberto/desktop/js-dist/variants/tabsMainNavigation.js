(function($) {
	"use strict";

	var api = {};
	var isEnabledClass = "is-enabled";
	var KEYS = {
		TAB: 9,
		ESC: 27,
		SPACE: 32
	};

	function findTabsContent($navItemLink, $tabsContents) {
		var tabId = ($navItemLink.attr("data-tab-id") || $navItemLink.attr("href")).substring(1);

		return $tabsContents.filter("[id='" + tabId + "']");
	}

	function containsMultipleLinks($tabsContent) {
		return $tabsContent.find(".navigation-item").length > 1;
	}

	function TabsMainNavigation($tabs) {
		this.$tabs = $tabs;
		this.$navItems = $tabs.find(".tabs-nav-item");
		this.$navItemLinks = this.$navItems.children("a");
		this.$tabsContents = $tabs.find(".tabs-content");

		$tabs.find(".navigation-item-decoration").removeAttr("tabindex");
		this.bindUIEvents();
	}

	TabsMainNavigation.prototype.bindUIEvents = function() {
		this.$navItemLinks.on("focusin", function(event) {
			var $target = $(event.target);
			var $tabsContent = findTabsContent($target, this.$tabsContents);

			this.$navItems.removeClass(isEnabledClass);
			this.$tabsContents.removeClass(isEnabledClass);

			$target.parent().addClass(isEnabledClass);
			// Don't open doormat if it contains only one item
			if (containsMultipleLinks($tabsContent)) {
				$tabsContent.addClass(isEnabledClass);
			}
		}.bind(this));

		this.$navItemLinks.last().on("focusout", function() {
			this.$navItems.removeClass(isEnabledClass);
			this.$tabsContents.removeClass(isEnabledClass);
		}.bind(this));

		this.$tabs.on("keydown", function(event) {
			this.keyDownHandler(event);
		}.bind(this));
	};

	TabsMainNavigation.prototype.keyDownHandler = function(event) {
		switch (event.which) {
			case KEYS.SPACE:
			case KEYS.TAB:
				this.focusIntoSubMenu(event);
				break;
			case KEYS.ESC:
				this.exitMenu();
				break;
			default:
				break;
		}
	};

	TabsMainNavigation.prototype.focusIntoSubMenu = function(event) {
		// focus into sub-menu
		var $focusedElem = $(document.activeElement);
		var $navItem = $focusedElem.parent();
		var $tabsContent = findTabsContent($focusedElem, this.$tabsContents);
		var isShift = !!event.shiftKey; // ignore if user is tabbing backwards

		if ($navItem.hasClass("tabs-nav-item") && containsMultipleLinks($tabsContent) && !isShift) {
			event.preventDefault();
			$tabsContent.find(".navigation-item > a").first().focus();
		} else {
			this.focusOntoNextMenuItem(event);
		}
	};

	TabsMainNavigation.prototype.exitMenu = function() {
		// close menu if focus is in sub-menu
		var $focusedElem = $(document.activeElement);

		if ($focusedElem.parents(".tabs-content").length) {
			this.$navItems.removeClass(isEnabledClass);
			this.$tabsContents.removeClass(isEnabledClass);
		}
	};

	TabsMainNavigation.prototype.focusOntoNextMenuItem = function(event) {
		// focus on next main menu item (either direction)
		var $target = $(event.target);
		var $tabsContent = $target.parents(".tabs-content");

		if ($tabsContent.length) {
			var $visibleLinks = $tabsContent.find("a").filter(function() {
				return $(this).css("visibility") !== "hidden";
			});
			var isFirstLinkFocused = $visibleLinks.get(0) === event.target;
			var isLastLinkFocused = $visibleLinks.get(-1) === event.target;

			if ((isFirstLinkFocused && event.shiftKey) || isLastLinkFocused) {
				var tabId = $tabsContent.attr("id");
				var $relatedNavItem = this.$tabs.find("a[href='#" + tabId + "'], a[data-tab-id='#" + tabId + "']").parent();
				var $nextItemToFocus = event.shiftKey ? $relatedNavItem.children() : $relatedNavItem.next().children();

				event.preventDefault();
				$nextItemToFocus.focus();
			}
		}
	};

	api.onRegister = function(scope) {
		new TabsMainNavigation(scope.$scope);
	};

	Cog.registerComponent({
		name: "TabsMainNavigation",
		api: api,
		selector: ".tabs-main-navigation"
	});

	return api;
}(Cog.jQuery()));
