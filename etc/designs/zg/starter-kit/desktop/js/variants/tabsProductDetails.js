(function($) {
	"use strict";

	function TabsProductDetails($el) {
		this.$el = $el;
		this.$wrapper = this.$el.find("> .component-content");
		this.$tab = this.$el.find(".tabs-nav");
		this.$tabItems = this.$el.find(".tabs-nav-item");
		this.$contents = this.$el.find(".tabs-content");

		this.bindEnquire();
	}

	TabsProductDetails.prototype = {
		bindEnquire: function() {
			var clickHandler = this.onClose.bind(this);
			enquire.register("only screen and (max-width: " + breakpoints.maxNotebook + "px)", {
				match: function() {
					$.each(this.$tabItems, (function(index, item) {
						var $item = $(item);
						var $content = this.findCorrespondingContent($item);
						$content.detach().insertAfter($item);
					}).bind(this));
					this.$tab.on("click", ".is-active", clickHandler);
				}.bind(this),
				unmatch: function() {
					this.$contents.detach().appendTo(this.$wrapper);
					this.$tab.unbind("click", clickHandler);
					this.showHiddenTabs();
				}.bind(this)
			});
		},
		onClose: function(e) {
			var $tab = $(e.currentTarget);
			var $content = this.findCorrespondingContent($tab);
			e.preventDefault();
			$tab.removeClass("is-active");
			$content.addClass("is-hidden");
		},
		showHiddenTabs: function() {
			if (!(this.$tabItems.hasClass("is-active"))) {
				var $firstTab = this.$tabItems.first();
				var $content = this.findCorrespondingContent($firstTab);
				$firstTab.addClass("is-active");
				$content.removeClass("is-hidden");
			}
		},
		findCorrespondingContent: function($item) {
			var id = $item.find("> a").attr("href").substring(1);
			var content = $.grep(this.$contents.toArray(), function(e) {
				return e.id === id;
			});

			return $(content);
		}
	};

	var breakpoints;
	var api = {
		onRegister: function(scope) {
			breakpoints = breakpoints || this.external.breakpoints;

			new TabsProductDetails(scope.$scope);
		}
	};

	Cog.registerComponent({
		name: "tabsTabsProductDetails",
		api: api,
		selector: ".tabs-product-details",
		requires: [{
			name: "utils.breakpoints",
			apiId: "breakpoints"
		}]
	});
})(Cog.jQuery());
