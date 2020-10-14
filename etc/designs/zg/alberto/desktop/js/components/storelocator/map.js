(function($) {
	"use strict";

	window.googleMapsCallback = function() {
		Cog.fireEvent("storelocator.map", "ready");
	};

	function GMaps($holder, $template, config) {
		this.$holder = $holder;
		this.setConfig(config);
		this.deferred = $.Deferred();
		this.promise = this.deferred.promise();
		this.template = doT.template($template.text());
		this.map = null;
		this.markers = [];

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
	}

	GMaps.prototype = {
		setConfig: function(config) {
			var ratio = idx(["map", "ratio"], config);
			this.config = config;

			if (ratio && typeof ratio !== "function") {
				this.config.map.ratio = function() {
					return ratio || 1;
				};
			}
		},

		init: function() {
			this.bindEvents();
			this.loadScript();
			return this.promise;
		},

		app: function(fn) {
			return this.promise.then(this.fn(function() {
				this.fn(fn)();
			}));
		},

		bindEvents: function() {
			Cog.addListener("storelocator.map", "ready", this.onLoadScript);
			Cog.addListener("storelocator.map", "reset", this.clearMarkers);
			Cog.addListener("storelocator.map", "userlocation.change", this.panTo);
			Cog.addListener("storelocator.map", "userlocation.change", this.sessionPos);
			$(window).resize($.debounce(400, this.onResize));
		},

		loadScript: function() {
			if ($("#googleMapsJsApi").length) {
				return;
			}

			var script = document.createElement("script");
			script.id = "googleMapsJsApi";
			script.src = this.config.mapsUrl
				.replace("{apiKey}", this.config.apiKey)
				.replace("{callback}", "googleMapsCallback");
			document.body.appendChild(script);
		},

		onLoadScript: function() {
			this.deferred.resolve();
		},

		getDefaultPos: function() {
			// to override the default position in the CMS use a block component
			// see https://confluence.cognifide.com/confluence/x/k6f5B
			var pos = { // NY fallback
				latitude: 40.7590403,
				longitude: -74.0392705
			};
			var latitude = parseFloat($(".gmap-coords-default [name='latitude']").val());
			var longitude = parseFloat($(".gmap-coords-default [name='longitude']").val());
			if (!isNaN(latitude) && !isNaN(longitude)) {
				pos.latitude = latitude;
				pos.longitude = longitude;
			}
			return pos;
		},

		panTo: function(e) {
			if (e && e.eventData && e.eventData.coords && this.map) {
				var latLng = this.validateCoords(e.eventData.coords, true);
				this.map.panTo(latLng);
			}
		},

		sessionPos: function(e) {
			var pos;
			if (e && e.eventData && e.eventData.coords) {
				pos = this.validateCoords({
					latitude: e.eventData.coords.latitude,
					longitude: e.eventData.coords.longitude
				}, false);
			}
			if (pos) {
				sessionStorage.setItem("sessionPos", JSON.stringify(pos));
			}
		},

		validateCoords: function(coords, formatLatLng) {
			// if formatLatLng === true, return type is LatLng else its {latitude: XX, longitude: XX}
			// check coords are a valid lat/lng combination
			// if not return undefined, default settings will be used
			var pos;
			var latLang;
			try {
				latLang = new google.maps.LatLng({
					lat: coords.latitude,
					lng: coords.longitude
				});
				pos = {
					latitude: latLang.lat(),
					longitude: latLang.lng()
				};
				if (formatLatLng) {
					pos = latLang;
				}
			} catch (e) {
				sessionStorage.removeItem("sessionPos");
			}
			return pos;
		},

		buildMap: function(pos) {
			if (!pos && sessionStorage.getItem("sessionPos")) {
				// check if there are coords for this session
				// if so check they are valid LatLng
				var sessionPos = JSON.parse(sessionStorage.getItem("sessionPos"));
				pos = this.validateCoords({
					latitude: sessionPos.latitude,
					longitude: sessionPos.longitude
				}, false);
			}

			pos = pos || this.getDefaultPos();

			if (!this.map) {
				this.map = new google.maps.Map(this.$holder[0], {
					zoom: 12,
					clickableIcons: false,
					center: {lat: + pos.latitude, lng: + pos.longitude},
					scrollwheel: idx(["zoomOnScroll"], this.config) !== false,
					disableDefaultUI: true,
					styles: idx(["map", "style"], this.config) || []
				});
			}
		},

		clearMarkers: function() {
			this.markers.forEach(function(marker) {
				marker.m.setMap(null);
				marker.i.close();
			});
			this.markers.length = 0;
		},

		closeAllInfoWindows: function() {
			this.markers.forEach(this.fn(function(marker) {
				marker.i.close();
				if (marker.m.getIcon() === this.config.pinIconActiveUrl) {
					marker.m.setIcon(this.config.pinIconUrl);
				}
			}));
		},

		addMarkerEvent: function(marker, index) {
			google.maps.event.addListener(marker.m, "click", this.fn(function() {
				this.select(marker);
				Cog.fireEvent("storelocator", "results:select", {
					index: index,
					scroll: true
				});
			}));

			google.maps.event.addListener(marker.i, "closeclick", this.fn(function() {
				marker.m.setIcon(this.config.pinIconUrl);
			}));
		},

		select: function(data, center) {
			var marker = data;
			if (typeof data === "number") {
				marker = this.markers[data];
			}
			this.closeAllInfoWindows();
			marker.m.setIcon(this.config.pinIconActiveUrl);
			marker.i.open(this.map, marker.m);

			if (center !== false) {
				this.center(marker.m.getPosition());
			}
		},

		fixBoundsRatio: function(bounds) {
			// fixes the ratio of the selected bounds based on the map config obj
			var ne = bounds.getNorthEast();
			var sw = bounds.getSouthWest();

			var width = Math.abs(ne.lng() - sw.lng());
			var height = Math.abs(ne.lat() - sw.lat());

			// will get the amount of lat that needs to be added on the
			//top and bottom of the bounds
			var heightDiff = (width * this.config.map.ratio() - height) * 0.5;
			var newNE = new google.maps.LatLng(ne.lat() + heightDiff, ne.lng());
			var newSW = new google.maps.LatLng(sw.lat() - heightDiff, sw.lng());

			bounds.extend(newNE);
			bounds.extend(newSW);

			return bounds;
		},

		addMarkers: function(data) {
			var bounds;

			data.forEach(this.fn(function(item, index) {
				var marker = {
					m: new google.maps.Marker(),
					i: new google.maps.InfoWindow({
						maxWidth: 300
					})
				};
				this.markers.push(marker);
				marker.i.setContent(this.template(item));
				marker.m.setOptions({
					position: {lat: + item.latitude, lng: + item.longitude},
					map: this.map,
					icon: this.config.pinIconUrl
				});
				bounds = bounds || new google.maps.LatLngBounds(marker.m.getPosition(), marker.m.getPosition());
				bounds.extend(marker.m.getPosition());

				this.addMarkerEvent(marker, index);
			}));

			if (bounds) {
				this.map.fitBounds(this.fixBoundsRatio(bounds));
				this.center(this.map.getCenter());
			}
		},

		refresh: function(data) {
			this.clearMarkers();
			this.buildMap(data[0]);

			if (!this.map) {
				google.maps.event.addListenerOnce(this.map, "tilesloaded", function() {
					this.addMarkers(data);
				});
			} else {
				this.addMarkers(data);
			}
		},

		center: function(position) {
			this.lastPosition = position;
			var left = this.map.getBounds().getSouthWest().lng();
			var right = this.map.getBounds().getNorthEast().lng();
			this.map.setCenter(new google.maps.LatLng(
				position.lat(),
				// displace the center of the map half side the viewport + config value (1 to right and -1 to left)
				position.lng() - (right - left) * (0.5 * (this.config.map.centerDisplacement[breakpoints.current] || 0))
			));
		},

		onResize: function() {
			google.maps.event.trigger(this.map, "resize");
			this.center(this.lastPosition || this.map.getCenter());
		}
	};

	var bindAll, idx, breakpoints;
	var api = {
		// use init to make dependencies available to this module.
		init: function() {
			bindAll = this.external.bindAll;
			idx = this.external.idx;
			breakpoints = this.external.breakpoints;
		}
	};

	Cog.registerStatic({
		name: "storelocator.map",
		api: api,
		sharedApi: GMaps,
		requires: [{
			name: "utils.breakpoints",
			apiId: "breakpoints"
		},{
			name: "utils.bindAll",
			apiId: "bindAll"
		},{
			name: "utils.idx",
			apiId: "idx"
		}]
	});

})(Cog.jQuery());
