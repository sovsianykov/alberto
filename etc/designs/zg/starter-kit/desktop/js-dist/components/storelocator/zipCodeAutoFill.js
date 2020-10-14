/*jshint -W024 */
(function($) {
	"use strict";

	function ZipCodeAutoFill($button, $target, config) {
		this.$button = $button;
		this.$target = $target;
		this.apiURL = config.geoCodeUrl;
		this.apiKey = config.apiKey;

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
		this.bindEvents();
		this.prefillZip();
	}

	ZipCodeAutoFill.prototype = {
		bindEvents: function() {
			this.$button.on("click", this.loadZipCode);
			this.$target.on("blur", this.storeAndProagateZipCode);
		},

		storeAndProagateZipCode: function() {
			this.storeZipCode();
			this.propagateZipCode();
		},

		storeZipCode: function() {
			var zipCode = this.$target.val();
			if (this.zipIsValid(zipCode)) {
				sessionStorage.setItem("zipCode", zipCode);
			}
		},

		propagateZipCode: function(zip) {
			var zipCode = zip || this.$target.val();
			if (this.zipIsValid(zipCode)) {
				$("[name=postalCode]").val(zipCode);
			}
		},

		prefillZip: function() {
			var zipCode = sessionStorage.getItem("zipCode");
			if (zipCode) {
				this.propagateZipCode(zipCode);
			}
		},

		zipIsValid: function(zipCode) {
			var valid = zipCode ? true : false;
			if (!validRegEx) {// only do this once
				var pattern = this.$target.attr("pattern");
				if (pattern) {
					validRegEx = new RegExp(pattern);
				}
			}
			if (validRegEx && !validRegEx.test(zipCode)) {
				valid = false;
			}
			return valid;
		},

		getGeolocation: function() {
			var promise = $.Deferred();
			if ("geolocation" in navigator) {
				navigator.geolocation.getCurrentPosition(promise.resolve, promise.reject);
			} else {
				promise.reject({
					message: "Browser doesn't support geolocation"
				});
			}
			return promise.promise();
		},

		getByType: function(data) {
			var rest = Array.prototype.slice.call(arguments, 1);
			if (data && rest[0]) {
				var ret = data.filter(function(elm) {
					return elm.types.indexOf(rest[0]) > -1;
				})[0];

				if (!ret && rest.length) {
					ret = this.getByType.apply(null, [data].concat(rest.slice(1)));
				}

				return ret;
			}
			return null;
		},

		parseJSON: function(data) {
			var addressList = idx(["address_components"], this.getByType(data.results, "street_address", "postal_code", "premise"));
			return idx(["long_name"], this.getByType(addressList, "postal_code"));
		},

		loadZipCode: function() {
			if (this.$button.hasClass("loading")) {
				return;
			}

			this.$button.addClass("loading");
			this.getGeolocation()
				.then(this.onGetGeolocationSuccess)
				.fail(this.onGetGeolocationFail);
		},

		onGetGeolocationFail: function() {
			this.$button.removeClass("loading");
		},

		onGetGeolocationSuccess: function(pos) {
			var url = this.apiURL
						.replace("{lat}", pos.coords.latitude)
						.replace("{long}", pos.coords.longitude)
						.replace("{key}", this.apiKey);

			Cog.fireEvent("storelocator.map", "userlocation.change", pos);
			$.getJSON(url)
				.then(this.fn(function(data) {
					var zipCode = this.parseJSON(data);
					if (zipCode) {
						this.$target.val(zipCode);
						this.storeAndProagateZipCode();
					}
				}))
				.always(this.fn(function() {
					this.$button.removeClass("loading");
				}));
		}
	};

	var idx, bindAll, validRegEx;
	var api = {
		// use init to make dependencies available to this module.
		init: function() {
			idx = this.external.idx;
			bindAll = this.external.bindAll;
		}
	};

	Cog.registerStatic({
		name: "storelocator.zipCodeAutoFill",
		api: api,
		sharedApi: ZipCodeAutoFill,
		requires: [{
			name: "utils.idx",
			apiId: "idx"
		},{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});

})(Cog.jQuery());
