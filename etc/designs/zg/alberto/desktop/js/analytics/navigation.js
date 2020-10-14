/**
 * Navigation Analytics
 */

(function($) {
	"use strict";

	var analyticsUtils;
	var analyticsDef;
	var api = {};

	var SELECTORS = {
		navigation: ".navigation"
	};

	var navElemsLength = $(SELECTORS.navigation).length;
	var intializedNavElemLength = 0;

	function Nav($nav) {
		this.$nav = $nav;
		this.bindAnalytics();
	}

	Nav.prototype.bindAnalytics = function() {
		var self = this;
		var $navLinks = self.$nav.find(".navigation-item-title");
		var componentPosition = analyticsUtils.getComponentPosition(self.$nav);
		intializedNavElemLength++;
		
		track();

		function track() {
			//In case when there are single link and navigation is within the Tab, it
			//doesn't show itself, but Tab work as a navigation link
			if (isSingleNavigationInTab()) {
				var tabId = "\#" + self.$nav.closest(".tabs-content").attr("id");
				var $navSingleLink = self.$nav.closest(".component-content").find(
						".tabs-nav").find("[href='" + tabId + "']");

				trackLinks($navSingleLink, $navLinks.attr("href"));
			} else {
				trackLinks($navLinks);
			}
		}

		function isSingleNavigationInTab() {
			return hasSingleLink() && isInsideTab() && isSingleNavigationComponent();
		}

		function isInsideTab() {
			return self.$nav.closest(".tabs-content").length !== 0;
		}

		function isSingleNavigationComponent() {
			return self.$nav.siblings().filter(".navigation").length === 0;
		}

		function hasSingleLink() {
			return $navLinks.length === 1;
		}

		function trackLinks($links, href) {

			analyticsUtils.trackLinks($links, {
				componentName: "Navigation",
				href: href,
				componentPosition: componentPosition,
				type: analyticsDef.ctConstants.navigation
			});

			if (navElemsLength === intializedNavElemLength) {
				// once all navigation selectors are registered with Cog 
				// then firing this event to clone header with Events in header.js
				Cog.fireEvent("Navigation", "MobileMenuAnalytics");
			}
		}
	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		new Nav(scope.$scope);
	};

	Cog.registerComponent({
		name: "navigationAnalytics",
		api: api,
		selector: ".navigation",
		requires: [
			{
				name: "analytics.utils",
				apiId: "utils"
			},
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			}
		]
	});

	return api;
}(Cog.jQuery()));
