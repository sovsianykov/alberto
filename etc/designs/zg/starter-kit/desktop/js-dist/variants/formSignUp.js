(function($, _) {
	"use strict";

	var refs = {
		_country: {
			selector: "[name=locale]"
		},
		_email: {
			selector: "[name=email]",
			limit: 70,
			country: ["en-us", "en-ca"]
		},
		_firstName: {
			selector: "[name=givenName]",
			limit: 30,
			country: ["en-us", "en-ca"]
		},
		_lastName: {
			selector: "[name=familyName]",
			limit: 30,
			country: ["en-us", "en-ca"]
		},
		_postalCode: {
			selector: "[name=postalCode]",
			limit: 10, // 9 digits plus hyphen
			country: ["en-us"]
		},
		_postalCode_Ca: {
			selector: "[name=postalCode]",
			country: ["en-ca"]
		}
	};

	var bindAll;

	var api = {
		onRegister: function(scope) {
			bindAll = bindAll || this.external.bindAll;
			new FormSignUp(scope.$scope);
		}
	};

	function FormSignUp($el) {
		this.$el = $el;
		bindAll(this);
		this.init();
	}

	FormSignUp.prototype = {
		init: function() {
			this.bindDOM();
			this.getCountry();
			this.setMaxLength();
		},

		getCountry: function() {
			this.country = this.$country.val();
			if (this.country) {
				this.country = this.country.toLowerCase();
			}
			return this.country;
		},

		isFieldInCurrentCountry: function(countries) {
			return _.includes(countries, this.country);
		},

		bindDOM: function() {
			this.$country = this.$el.find(refs._country.selector);
		},

		setMaxLength: function() {
			_.forEach(refs, function(item) {
				var isFieldInCurrentCountry = this.isFieldInCurrentCountry(item.country);

				if (item.limit && isFieldInCurrentCountry) {
					$(item.selector).attr("maxlength", item.limit);
				}
			}.bind(this));
		}
	};

	Cog.registerComponent({
		name: "formSignUp",
		api: api,
		selector: ".sign-up-form",
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});
})(Cog.jQuery(), _);
