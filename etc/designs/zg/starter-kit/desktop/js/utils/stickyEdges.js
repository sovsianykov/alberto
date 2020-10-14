(function($) {
	"use strict";

	function stickyEdges($holder, $edges, config) {
		config = $.extend({
			padding: 0
		}, config);
		var $w = $(window);
		var fixed = false;
		var $ghost = $($holder[0].cloneNode());
		$holder.before($ghost);

		function isFixed(fn) {
			return function() {
				return fixed && fn.apply(null, arguments);
			};
		}

		function fix() {
			var maxEdge = $edges.offset().top + $edges.outerHeight();
			var maxHolder = $w.scrollTop() + $holder.outerHeight() + config.padding;

			$holder.css({
				"position": "fixed"
			});
			$ghost.show();
			$holder.css({
				"left": $ghost.offset().left,
				"top": (maxHolder <= maxEdge ? 0 : maxEdge - maxHolder) + config.padding,
				"width": $ghost.outerWidth()
			});
			fixed = true;
		}

		function reset() {
			$ghost.hide();
			$holder.css({
				"position": "",
				"top": "",
				"width": ""
			});
			fixed = false;
		}

		function getDistance($holder) {
			return $holder.offset().top - $w.scrollTop() - config.padding;
		}

		function check() {
			var distance = getDistance(fixed ? $ghost : $holder);
			(distance < 0 ? fix : reset)();
		}

		function isDesktopScreen(fn) {
			return function() {
				if (window.innerWidth >= 768) {
					fn.apply(null, arguments);
				}
			};
		}

		$w.on("stickyEdges:refresh", isDesktopScreen(check));
		$w.on("scroll", isDesktopScreen(check));
		$w.on("resize", isDesktopScreen(isFixed(fix)));
		reset();
		setTimeout(isDesktopScreen(check), 500);
	}

	Cog.registerStatic({
		name: "utils.stickyEdges",
		api: {},
		sharedApi: stickyEdges
	});

})(Cog.jQuery());
