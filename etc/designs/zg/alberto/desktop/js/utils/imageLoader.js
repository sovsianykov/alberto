(function($) {
	"use strict";

	var cache = [];

	function getCache(src) {
		return $.grep(cache, function(a) {
			return a.src === src;
		}).pop();
	}

	function loadImg(src, img) {
		var defered = $.Deferred();
		var promise = defered.promise();
		var cached = getCache(src);

		if (cached) {
			return cached.promise;
		}

		var $img = $(img || document.createElement("img"));
		$img.one("load", function() {
			defered.resolve(src);
		});
		$img.one("error", defered.reject);
		$img.attr("src", src);

		cache.push({
			src: src,
			promise: promise
		});

		return promise;
	}

	Cog.registerStatic({
		name: "utils.loadImg",
		api: {},
		sharedApi: loadImg
	});

}(Cog.jQuery()));
