/* global IScroll */
(function($) {
	"use strict";

	function buildZoom(loadImg) {
		return function($scope, $body) {
			var renditionRegExp = /\.rendition\.\d+x\d+/;
			var $zoomOut, $holder, $zoomPhoto, $zoomImg, zoomScroll;
			var $zoomIn = $scope.find(".zoom-in-icon"); // I assume that zoom icon is in the same wrapper as <img>.
			var $img = $scope.find("img").eq(0);

			function openZoom() {
				loadImg($img.attr("src").replace(renditionRegExp, ""), $zoomImg)
					.then(function() {
						$zoomPhoto.append($zoomImg);
						$holder.addClass("active");

						$zoomPhoto.css({
							"min-width": $zoomImg[0].width,
							"min-height": $zoomImg[0].height
						});
						zoomScroll = zoomScroll || new IScroll($holder[0], {
							mouseWheel: true,
							scrollX: true,
							freeScroll: true
						});
						zoomScroll.scrollTo(Math.min(($zoomImg[0].width - $holder.outerWidth()) * -0.5, 0), 0, 0);
					});
			}

			function open() {
				$holder.addClass("active");
			}

			function close() {
				$holder.removeClass("active");
			}

			function buildStructure() {
				// That's the HTML structure:
				// <div class="zoom-holder" /> // iscroll wrapper
				// 	<div class="zoom-photo" /> // photo holder
				// 		<img> // image
				$zoomOut = $("<button title=\"close\" class=\"zoom-out-icon\" />");
				$holder = $("<div class=\"zoom-holder\" />");
				$zoomPhoto = $("<div class=\"zoom-photo\" />");
				$zoomImg = $("<img>");
				$holder.append($zoomPhoto);
				$holder.append($zoomOut);
				$body.append($holder);
			}

			function addHandlers() {
				$zoomIn.on("click", openZoom);
				$zoomOut.on("click", close);
			}

			buildStructure();
			addHandlers();

			return {
				open: open,
				close: close
			};
		};
	}

	var api = {
		onRegister: function(scope) {
			var zoom = buildZoom(this.external.loadImg);
			var $elem = scope.$scope;

			if ($elem.find(".listing--product-variants").length > 0) {
				$elem.find(".listing-item").each(function(i, elm) {
					zoom($(elm), $elem);
				});
			}
		}
	};

	Cog.registerComponent({
		name: "photo-zoom",
		api: api,
		selector: ".full-photo-holder-bleed, .full-photo-holder",
		requires: [{
			name: "utils.loadImg",
			apiId: "loadImg"
		}]
	});
})(Cog.jQuery());
