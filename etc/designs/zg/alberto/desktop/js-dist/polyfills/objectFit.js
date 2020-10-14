(function($, Modernizr) {
	"use strict";
	// HTML must match;
	// <element> <img src="" /> </element>
	// output;
	// <element class="object-fit-polyfill" style="background-image:url(img.src)"> <img src="" /> </element>

	// polyfill object-fit css property
	var ObjectFit = {
		isSupported: Modernizr.objectfit,
		polyfill: function($scope, selector) {
			if (!this.isSupported) {
				$scope.find(selector).each(function(i, el) {
					var $container = $(el);
					var src = $container.find("img").prop("src");
					if (src) {
						$container
							.css({"backgroundImage": "url(" + src + ")"})
							.addClass("object-fit-polyfill");
					}
				});
			}
		}
	};

	Cog.registerStatic({
		name: "utils.objectFit",
		api: {},
		sharedApi: ObjectFit
	});

})(Cog.jQuery(), Modernizr);
