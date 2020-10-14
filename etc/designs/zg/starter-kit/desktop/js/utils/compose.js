(function() {
	"use strict";

	// function used to compose other functions, like a shortcut for currying
	// technique:
	// Usage: compose(fn3, fn2, fn1)
	// This is the same as doing fn3(fn2(fn1));
	function compose() {
		var fn = [].slice.call(arguments);
		return function(data) {
			return fn.reduceRight(function(a, b) {
				return b(a);
			}, data);
		};
	}

	Cog.registerStatic({
		name: "utils.compose",
		api: {},
		sharedApi: compose
	});
}());

