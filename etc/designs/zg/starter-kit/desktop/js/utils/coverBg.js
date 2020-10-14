(function($) {
	"use strict";

	function getRatio(elm) {
		return elm.offsetHeight / elm.offsetWidth;
	}

	function applyRatioSize($elm) {
		$elm.css({height: "", width: ""});
		var ratio = getRatio($elm[0]);
		var parentRatio = getRatio($elm[0].parentNode);
		var parentSize = {w: $elm[0].parentNode.offsetWidth, h: $elm[0].parentNode.offsetHeight};
		if (parentRatio < ratio) {
			$elm.css("height", parentSize.w / ratio);
			$elm.css("width", parentSize.w);
		} else {
			$elm.css("height", parentSize.h);
			$elm.css("width", parentSize.h / ratio);
		}
	}

	function ratioRefresh($list) {
		return function() {
			$list.each(function(i, elm) {
				applyRatioSize($(elm));
			});
		};
	}

	function coverBg($holder) {
		var refresh = ratioRefresh($holder);
		$(window)
			.on("resize", $.debounce(150, refresh))
			.on("resize", $.throttle(150, refresh));
		refresh();
		$holder.addClass("cover-ready");
	}

	Cog.registerStatic({
		name: "utils.coverBg",
		api: {},
		sharedApi: coverBg
	});

})(Cog.jQuery());
