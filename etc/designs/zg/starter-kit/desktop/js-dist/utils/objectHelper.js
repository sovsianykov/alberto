(function() {
	"use strict";

	var api = {};
	var	sharedApi = {};
	var	loaded = false;
	var load = function() {
		loaded = true;
	};

	window.runOnWindowLoad(load);

	// Checks the existence of nested JavaScript object key:
	// if(has(obj, "prop1.prop2.prop3"))
	// instead of if(obj && obj.prop1 && obj.prop1.prop2 && obj.prop1.prop2.prop3)
	//
	sharedApi.has = function(obj, key) {
		return key.split(".").every(function(x) {
			if (typeof obj !== "object" || obj === null || !(x in obj)) {
				return false;
			}
			obj = obj[x];
			return true;
		});
	};

	sharedApi.isLoaded = function() {
		return loaded;
	};

	Cog.registerStatic({
		name: "utils.objectHelper",
		api: api,
		sharedApi: sharedApi
	});
})(Cog.jQuery());
