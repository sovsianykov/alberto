/**
 * Map
 * https://developers.google.com/maps/documentation/javascript/reference
 */

(function($) {
	"use strict";

	var api = {},
		script = false,
		loaded = false,
		$maps = [],
		URL = "https://maps.googleapis.com/maps/api/js",
		defaultOptions = {
			height: 250,
			zoom: 14,
			latitude: 51.500134,
			longitude: -0.12623,
			mapType: "ROADMAP",
			markers: []
		};

	function loadScript(params) {
		if (script) {
			return;
		}

		var scriptElement = document.createElement("script"),
			to = document.getElementsByTagName("script")[0];
		scriptElement.async = true;
		scriptElement.src = URL + "?" + $.param(params);
		to.parentNode.insertBefore(scriptElement, to);
		script = true;
	}

	function showMarkers(scope) {
		if (!scope.mapOptions.markers.length) {
			return;
		}

		var marker, k, infoWindow, tmarker;

		for (k in scope.mapOptions.markers) {
			if (scope.mapOptions.markers.hasOwnProperty(k) && scope.mapOptions.markers[k].title.length) {
				marker = scope.mapOptions.markers[k];
				tmarker = new google.maps.Marker({
					position: new google.maps.LatLng(marker.latitude, marker.longitude),
					map: scope.gmap,
					title: marker.title
				});

				if (marker.description.length) {
					infoWindow = new google.maps.InfoWindow({
						content: marker.description
					});

					google.maps.event.addListener(tmarker, "click", openInfoWindow(tmarker, infoWindow, scope.gmap));
				}
			}
		}
	}

	function openInfoWindow(tmarker, infoWindow, gMap) {
		return (function(tmarker, infoWindow) {
			return function() {
				infoWindow.open(gMap, tmarker);
			};
		})(tmarker, infoWindow);
	}

	function onRegister(scope) {
		loaded = true;
		var map = scope,
				options = $.extend(defaultOptions, map.data()),
				centerPosition;

		map.height(options.height);

		centerPosition = new google.maps.LatLng(options.latitude, options.longitude);

		scope.mapOptions = {
			zoom: options.zoom,
			center: centerPosition,
			markers: options.markers,
			mapTypeId: google.maps.MapTypeId[options.mapType]
		};

		scope.gmap = new google.maps.Map(map[0], scope.mapOptions);

		showMarkers(scope);

		var tabContent = map.parents(".tabs-content");
		if (tabContent.size()) {
			Cog.addListener("tab", "change", function(e) {
				if (tabContent.attr("id") === e.eventData.id) {
					google.maps.event.trigger(scope.gmap, "resize");
				}
			});
		}
	}

	api.callback = function() {
		$maps.each(function() {
			onRegister($(this));
		});
		// reset array so other defined maps are not
		// touched on dynamic creation using Cog.init();
		$maps = [];
	};

	api.onRegister = function(element) {
		$maps.push(element.$scope);
		var browser = this.external.browser;
		var params = {};

		if (browser.msie && browser.version < 8) {
			return false;
		}

		if (loaded) {
			api.callback();
			return;
		}

		if (script) {
			return;
		}

		if (element.$scope.data("key")) {
			params.key = element.$scope.data("key");
		}
		params.callback = "Cog.component.map.callback";

		loadScript(params);
	};

	Cog.registerComponent({
		name: "map",
		api: api,
		selector: ".map-canvas",
		requires: [
			{
				name: "utils.browser",
				apiId: "browser"
			}
		]
	});

	Cog.component.map = api;

})(Cog.jQuery());
