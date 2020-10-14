(function() {
	"use strict";

	var steps = {
		productSelection: 1,
		zipCode: 2,
		findAStore: 3
	};

	function WhereToBuyResponsive($el) {
		this.$el = $el;
		// get the index based on variant on tab item
		var $mapTab = this.$el.find(".tab-item--map");
		var tabIndex = $mapTab.parents(".tabs-nav-item").index() || 1;
		this.$map = this.$el.find(".box-store-locator-map");
		this.$mapTab = this.$el.find(".tabs-content").eq(tabIndex);
		this.$mapHolder = this.$map.parent();
		this.lastPageState = {};

		$mapTab.parent("a").addClass("tab-item--map-link");

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);

		this.bindEnquire();
		this.bindListeners();
	}

	WhereToBuyResponsive.prototype = {
		sendMapToBackground: function() {
			if (this.$map.parent()[0] !== this.$mapHolder[0]) {
				this.$mapHolder.append(this.$map);
			}
		},

		sendMapToTab: function() {
			if (this.$map.parent()[0] !== this.$mapTab[0]) {
				this.$mapTab.append(this.$map);
			}
		},

		refreshLocation: function() {
			var sendToTab = [
				this.mobileView,
				this.activeStep === steps.findAStore
			].every(function(val) {
				return !!val;
			});

			if (sendToTab) {
				this.sendMapToTab();
			} else {
				this.sendMapToBackground();
			}
		},

		bindEnquire: function() {
			enquire.register("only screen and (max-width: " + breakpoints.maxMobile + "px)", {
				match: function() {
					this.lastPageState = SimpleState.getState("whereToBuy");
					this.mobileView = true;
					this.refreshLocation();
				}.bind(this),
				unmatch: function() {
					this.mobileView = false;
					this.refreshLocation();
					Cog.fireEvent("tab", "select", {
						index: idx(["results", "tabIndex"], this.lastPageState)
					});
				}.bind(this)
			});
		},

		bindListeners: function() {
			Cog.addListener("whereToBuy", "state:subscribe", function(e) {
				this.activeStep = idx(["eventData", "step"], e);
				this.refreshLocation();
			}.bind(this));
		}
	};

	var idx, breakpoints, SimpleState, bindAll;
	var api = {
		onRegister: function(scope) {
			breakpoints = breakpoints || this.external.breakpoints;
			SimpleState = SimpleState || this.external.SimpleState;
			idx = idx || this.external.idx;
			bindAll = bindAll || this.external.bindAll;

			new WhereToBuyResponsive(scope.$scope);
		}
	};

	Cog.registerComponent({
		name: "whereToBuy.responsive",
		api: api,
		selector: ".box-store-locator-holder",
		requires: [{
			name: "utils.breakpoints",
			apiId: "breakpoints"
		},{
			name: "utils.idx",
			apiId: "idx"
		},{
			name: "utils.bindAll",
			apiId: "bindAll"
		},{
			name: "utils.simpleState",
			apiId: "SimpleState"
		}]
	});
})();
