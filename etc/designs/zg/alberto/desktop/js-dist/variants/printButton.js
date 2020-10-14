(function() {
	"use strict";

	var api = {};

	function PrintButton($el) {
		this.$el = $el;

		this.allowFocus();
		this.bindEvents();
	}

	PrintButton.prototype = {
		allowFocus: function() {
			var $paragraph = this.$el.find("p");
			var label = $paragraph.text();

			$paragraph.replaceWith("<button>" + label + "</button>");
			this.$button = this.$el.find("button");
		},
		bindEvents: function() {
			this.$button.on("click", function() {
				window.print();
			}.bind(this));
		}
	};

	api.onRegister = function(scope) {
		new PrintButton(scope.$scope);
	};

	Cog.registerComponent({
		name: "printButton",
		api: api,
		selector: ".richText--print"
	});

})();

