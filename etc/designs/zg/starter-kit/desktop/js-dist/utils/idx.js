(function() {
	"use strict";

	// Safe way to return value from property deep in object (o) following
	// path (p). Eg.:
	// Use idx(['eventData', 'something', 'from', 'object'], obj) instead of
	// obj.eventData.something.from.object
	function idx(p, o) {
		return p.reduce(function(xs, x) {
			/*jshint eqeqeq:false */
			// tripple equal doesn't apply since this should be different from null or undefined
			return (xs && xs[x] != null) ? xs[x] : null;
		}, o);
	}

	Cog.registerStatic({
		name: "utils.idx",
		api: {},
		sharedApi: idx
	});
}());

