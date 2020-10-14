/**
 * Tabs component - desktop/js-component/component.tabs.js
 */

(function($) {
	"use strict";

	var api = {
		tabs: []
	};
	var analyticsDef;
	var analyticsUtils;

	function Tab($scope) {
		this.$scope = $scope;
		this.init();
		this.bindEvents();
	}

	Tab.prototype.init = function() {
		var $this = this.$scope;
		this.$contents = $this.find("> .component-content > .tabs-content");
		this.$contents.addClass("is-hidden");
		this.isVertical = $this.hasClass("tabs-vertical");
	};

	Tab.prototype.bindEvents = function() {
		var $tabs = this.$scope.find("> .component-content > .tabs-nav .tabs-nav-item"),
			self = this;

		function activateTabByIndex(i) {
			i = Math.min(Math.max(0, i), $tabs.length - 1);
			activateTab($tabs.eq(i));
		}

		function onClick(e, position) {
			var $target = $(e.currentTarget);
			var $tab = $(e.target).closest(".tabs-nav-item");
			var linkName = $tab.find(".text-wrapper").text();
			var tabPosition = $tab.index() + 1;

			if (!($target.hasClass("is-active"))) {
				e.stopPropagation();
			}
			e.preventDefault();
			activateTab($target);

			Cog.fireEvent("tabs", analyticsDef.CLICK.TABS_CLICK, {

				label: linkName + " - " + tabPosition + " - " + window.location.href,
				componentPosition: position
			});
		}

		function activateTab($tab) {
			self.$contents.addClass("is-hidden");
			var newPanel = self.$contents.filter($tab.find("a").attr("href"));
			newPanel.removeClass("is-hidden");
			$tabs.removeClass("is-active");
			$tab.addClass("is-active");

			Cog.fireEvent("tab", "change", {
				id: newPanel.attr("id"),
				index: $tab.index(),
				container: newPanel
			});
		}

		this.navWidth = this.$scope.find("> .component-content > .tabs-nav").width();
		this.listWidth = 0;
		this.listHeight = 0;
		$tabs.each(function() {
			self.listWidth += $(this).outerWidth(true);
			self.listHeight += $(this).outerHeight(true);
		});

		if (!this.isVertical) {
			if (this.navWidth < this.listWidth) {
				this.initializeScrolling();
			}
		} else {
			this.setContentHeight();
		}

		$tabs.on("click", function(e) {
			onClick(e, analyticsUtils.getComponentPosition(this.$scope));
		}.bind(this));

		activateTab($tabs.filter(".is-active"));

		Cog.addListener("tab", "select", function(e) {
			activateTabByIndex(e.eventData.index || 0);
		});

		this.addButtonToNextTab();
	};

	Tab.prototype.initializeScrolling = function() {

		var $switchers = this.$scope.find(".tabs-nav-switcher"),
			$switcherRight = $switchers.filter(".tabs-nav-switcher-right"),
			$switcherLeft = $switchers.filter(".tabs-nav-switcher-left"),
			$list = this.$scope.find(".tabs-nav-list"),
			self = this;

		$switcherRight.removeClass("is-hidden");
		$switchers.on("click", function() {
			var $this = $(this),
				difference = $this.hasClass("tabs-nav-switcher-right") ? -20 : 20,
				nextLeft = (parseInt($list.css("left"), 10) + difference);
			if (nextLeft < 0) {
				$switcherLeft.removeClass("is-hidden");
				if (-1 * nextLeft >= self.listWidth - self.navWidth) {
					$switcherRight.addClass("is-hidden");
				} else {
					$switcherRight.removeClass("is-hidden");
				}
			} else {
				$switcherLeft.addClass("is-hidden");
			}
			$list.stop().animate({left: nextLeft + "px"});
		});
	};

	Tab.prototype.setContentHeight = function() {
		var self = this;
		this.$contents.each(function() {
			if ($(this).height() < self.listHeight) {
				$(this).css("min-height", self.listHeight + "px");
			}
		});
	};

	Tab.prototype.addButtonToNextTab = function() {
		// check if this is the right page
		if ($(".tabs-who-we-are").length) {
			var $tabsLinks = $(".tabs-who-we-are .tabs-nav-list a").clone();
			var $tabs = $(".tabs-who-we-are .tabs-nav ~ .tabs-content > .tabContent > .paragraphSystem");

			$tabs.each(function(index) {
				if (index === 0) {
					$(this).append($($tabsLinks[index + 1]).addClass("button-tertiary"));
				} else {
					$(this).append($($tabsLinks[index - 1]).addClass("button-tertiary"));
				}
			});

			$tabsLinks.click(function(e) {
				e.preventDefault();
				var href = $(e.currentTarget).attr("href");

				var tabLinkToClick = $(".tabs-who-we-are .tabs-nav-list a[href='" + href + "'").parent("li");
				console.log(tabLinkToClick);
				tabLinkToClick.trigger("click");

				$("html, body").animate({
					scrollTop: tabLinkToClick.offset().top - 100
				}, 1000);
			});
		}
	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;

		api.tabs.push(new Tab(scope.$scope));
	};

	Cog.registerComponent({
		name: "tabs",
		api: api,
		selector: ".tabs[class*=default-]",
		requires: [{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
			{
				name: "analytics.utils",
				apiId: "utils"
			}]
	});
})(Cog.jQuery());
