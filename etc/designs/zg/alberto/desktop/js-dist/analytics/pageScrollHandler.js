(function($) {
	"use strict";

	var api = {};
	var events, utils, ctConstants, $window, winHeight, scrollDistance;
	var cache = [];

	api.init = function() {
		events = this.external.eventsDefinition.OTHER;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		$(window).on("scroll", _.throttle(function() {
			var marks = calculateMarks($(document).height());
			winHeight = window.innerHeight ? window.innerHeight : $window.height();
			scrollDistance = $(window).scrollTop() + winHeight;
			if (cache.length >= 4) {
				$(window).off("scroll");
				return;
			}
			checkMarks(marks, scrollDistance);
		}, 500));
	};

	function calculateMarks(docHeight) {
		return {
			"25%": parseInt(docHeight * 0.25, 10),
			"50%": parseInt(docHeight * 0.50, 10),
			"75%": parseInt(docHeight * 0.75, 10),
			// 35px cushion to trigger 100% event in iOS
			"100%": docHeight - 175
		};
	}

	function checkMarks(marks, scrollDistance) {
		$.each(marks, function(key, val) {
			if ($.inArray(key, cache) === -1 && scrollDistance >= val) {
				var attributes = {nonInteractive: {nonInteraction: 1}};
				utils.addTrackedEvent(ctConstants.pageScroll, key, ctConstants.custom, ctConstants.other, attributes);
				cache.push(key);
			}
		});
	}
	Cog.registerStatic({
		name: "analytics.pageScrollHandler",
		api: api,
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]
	});
}(Cog.jQuery()));
