/*jshint -W024 */
(function() {
	"use strict";

	function StepsController($holder, max) {
		this.$holder = $holder;
		this.max = max;
		this.prefix = "step-";
		this.generateClassNames();
	}

	StepsController.prototype = {
		generateClassNames: function() {
			var arr = [];
			arr.length = (this.max || 3) + 1;
			this.classNames = arr
				.join(".").split(".") // workaround to make array visible for map
				.map(function(val, i) {
					return this.prefix + i;
				}.bind(this))
				.slice(1).join(" ");
		},

		go: function(index) {
			index = Math.max(Math.min(index, this.max), 0);
			this.$holder
				.removeClass(this.classNames)
				.addClass(this.prefix + index);
		}
	};

	var api = {
		onRegister: function(element) {
			var idx = this.external.idx;
			var stepsController = new StepsController(element.$scope, 3);

			Cog.addListener("whereToBuy", "state:subscribe", function(e) {
				if (idx(["eventData", "type"], e) === "NAV") {
					stepsController.go(idx(["eventData", "step"], e) || 1);
				}
			});
		}
	};

	Cog.registerComponent({
		name: "whereToBuy.stepsController",
		api: api,
		selector: ".box-store-locator-holder",
		requires: [{
			name: "utils.idx",
			apiId: "idx"
		}]
	});

})(Cog.jQuery());
