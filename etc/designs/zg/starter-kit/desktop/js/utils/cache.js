(function() {
	"use strict";

	// Simple memory cache Class
	function Cache() {
		this.data = {};
	}

	Cache.prototype = {
		has: function(label) {
			return !!this.data[label];
		},
		value: function(label, value) {
			// if only label is passed, is a getter
			if (value === undefined) {
				return this.data[label];
			}
			// if label and value is passed, is a setter
			return (this.data[label] = value);
		}
	};

	Cog.registerStatic({
		name: "utils.cache",
		api: {},
		sharedApi: Cache
	});
}());

