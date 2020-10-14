(function($) {
	"use strict";
	// include self when using $.find e.g.
	// $("body").find("body").length === 0
	// $("body").findSelf("body").length === 1
	if (!$.fn.findSelf) {
		$.fn.findSelf = function(selector) {
			var result = this.find(selector);
			return (this.is(selector)) ?
				result.add(this) : result;
		};
	}
})(Cog.jQuery());
