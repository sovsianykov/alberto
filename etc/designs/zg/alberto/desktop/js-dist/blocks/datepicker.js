(function($) {
	"use strict";

	var api = {
		onRegister: function(scope) {
			if (this.external.check.isTouch()) {
				return;
			}

			var $el = scope.$scope;
			var config = $.extend({
				selectYears: 100,
				selectMonths: true,
				format: "mm-dd-yyyy",
				formatSubmit: "yyyy-mm-dd",
				labelMonthNext: "",
				labelMonthPrev: "",
				labelMonthSelect: "",
				labelYearSelect: "",
				weekdaysFull: ["", "", "", "", "", "", ""],
				hiddenName: true,
				max: true
			}, $el.data("datepicker"));

			$el.pickadate(config);
		}
	};

	Cog.registerComponent({
		name: "datePicker",
		api: api,
		selector: ".reference-datepicker input[type=date]",
		requires: [{
			name: "utils.touchCheck",
			apiId: "check"
		}]
	});
}(Cog.jQuery()));
