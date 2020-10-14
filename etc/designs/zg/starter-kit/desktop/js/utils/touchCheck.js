(function() {
	"use strict";

	Cog.registerStatic({
		name: "utils.touchCheck",
		api: {},
		sharedApi: {
			isTouch: function() {
				return navigator.maxTouchPoints !== undefined ? navigator.maxTouchPoints > 0 : "ontouchstart" in window;
			}
		}
	});
}());
