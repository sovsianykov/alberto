(function() {
	"use strict";

	var config = {
		map: {
			ratio: 1,
			centerDisplacement: {
				small: 0,
				mobile: 0,
				tablet: 0.6,
				notebook: 0.5,
				desktop: 0.5
			},
			style: [{
				"elementType": "geometry",
				"stylers": [{
					"color": "#f2f4f6"
				}]
			},
			{
				"elementType": "labels.icon",
				"stylers": [{
					"visibility": "off"
				}]
			},
			{
				"elementType": "labels.text.fill",
				"stylers": [{
					"color": "#616161"
				}]
			},
			{
				"elementType": "labels.text.stroke",
				"stylers": [{
					"color": "#f5f5f5"
				}]
			},
			{
				"featureType": "administrative.land_parcel",
				"elementType": "labels.text.fill",
				"stylers": [{
					"color": "#bdbdbd"
				}]
			},
			{
				"featureType": "poi",
				"elementType": "geometry",
				"stylers": [{
					"color": "#b1bfca"
				}]
			},
			{
				"featureType": "poi",
				"elementType": "labels.text.fill",
				"stylers": [{
					"color": "#000000"
				}]
			},
			{
				"featureType": "poi.park",
				"elementType": "geometry",
				"stylers": [{
					"color": "#dfe8ea"
				}]
			},
			{
				"featureType": "poi.park",
				"elementType": "labels.text.fill",
				"stylers": [{
					"color": "#6e7f8d"
				}]
			},
			{
				"featureType": "road",
				"elementType": "geometry",
				"stylers": [{
					"color": "#ffffff"
				}]
			},
			{
				"featureType": "road.arterial",
				"elementType": "labels.text.fill",
				"stylers": [{
					"color": "#6e7f8d"
				}]
			},
			{
				"featureType": "road.arterial",
				"elementType": "labels.text.stroke",
				"stylers": [{
					"color": "#ffffff"
				}]
			},
			{
				"featureType": "road.highway",
				"elementType": "geometry",
				"stylers": [{
					"color": "#b1bfca"
				}]
			},
			{
				"featureType": "road.highway",
				"elementType": "labels.text.fill",
				"stylers": [{
					"color": "#000000"
				}]
			},
			{
				"featureType": "road.highway",
				"elementType": "labels.text.stroke",
				"stylers": [{
					"color": "#ffffff"
				}]
			},
			{
				"featureType": "road.local",
				"elementType": "labels.text.fill",
				"stylers": [{
					"color": "#b1bfca"
				}]
			},
			{
				"featureType": "road.local",
				"elementType": "labels.text.stroke",
				"stylers": [{
					"color": "#ffffff"
				}]
			},
			{
				"featureType": "transit.line",
				"elementType": "geometry",
				"stylers": [{
					"color": "#b1bfca"
				}]
			},
			{
				"featureType": "transit.station",
				"elementType": "geometry",
				"stylers": [{
					"color": "#b1bfca"
				}]
			},
			{
				"featureType": "water",
				"elementType": "geometry",
				"stylers": [{
					"color": "#89e0e3"
				}]
			},
			{
				"featureType": "water",
				"elementType": "labels.text.fill",
				"stylers": [{
					"color": "#000000"
				}]
			},
			{
				"featureType": "water",
				"elementType": "labels.text.stroke",
				"stylers": [{
					"color": "#ffffff"
				}]
			}
		]}
	};

	Cog.registerStatic({
		name: "storelocator.config",
		api: {},
		sharedApi: config
	});
}());
