(function() {
	"use strict";

	// Automation of scope definition for prototype methods
	function bindAll(scope, data) {

		// wrapper to bind anonymous functions
		scope.fn = function(fn) {
			var parentArgs = Array.prototype.slice.call(arguments, 1);
			return function() {
				var args = Array.prototype.slice.call(arguments);
				return (fn && typeof fn === "function") ? fn.apply(scope, parentArgs.concat(args)) : undefined;
			};
		};

		if (data && data.constructor === Array) {
			data.forEach(function(l) {
				scope[l] = scope[l].bind(scope);
			});
			return;
		}
		for (var l in scope) {
			if (typeof scope[l] === "function") {
				scope[l] = scope[l].bind(scope);
			}
		}
	}

	Cog.registerStatic({
		name: "utils.bindAll",
		api: {},
		sharedApi: bindAll
	});
}());

