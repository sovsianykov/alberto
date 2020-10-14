(function($) {
	"use strict";
	function MobileBehaviour($el) {
		this.$el = $el;
		bindAll(this);
		this.init();
	}

	MobileBehaviour.prototype = {
		init: function() {
			enquire.register("only screen and (max-width: " + breakpoints.maxTablet + "px)", {
				match: this.matchMobile
			});

		},

		matchMobile: function() {
			var $filterCloud = $(".searchResults-options-container .filterCloud");

			if ($filterCloud.length && $filterCloud.text().trim() === "") {
				$filterCloud.remove();
			}
		}
	};

	var bindAll, breakpoints;
	var api = {
		onRegister: function(scope) {
			bindAll = bindAll || this.external.bindAll;
			breakpoints = breakpoints || this.external.breakpoints;
			new MobileBehaviour(scope.$scope);
		}
	};
	Cog.registerComponent({
		name: "search.mobileBehaviour",
		api: api,
		selector: ".searchTabNavigation",
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		},{
			name: "utils.breakpoints",
			apiId: "breakpoints"
		}]
	});
})(Cog.jQuery());
