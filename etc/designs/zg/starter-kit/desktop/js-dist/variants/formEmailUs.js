(function($, _) {
	"use strict";

	var _active = "is-active";

	var KEYS = {
		ENTER: 13
	};

	var refs = {
		_country: {
			selector: "[name=country]"
		},
		_title: {
			selector: ".fieldset-accordion legend"
		},
		_content: {
			selector: ".fieldset-accordion .fields"
		},
		_inquiryType: {
			selector: "[name=inquiryType]"
		},
		_email: {
			selector: "[name=email]",
			limit: 70,
			country: ["us", "ca"]
		},
		_prefix: {
			selector: "[name=prefix]",
			limit: 10,
			country: ["us", "ca"]
		},
		_firstName: {
			selector: "[name=givenName]",
			limit: 30,
			country: ["us", "ca"]
		},
		_lastName: {
			selector: "[name=familyName]",
			limit: 30,
			country: ["us", "ca"]
		},
		_streetAddress1: {
			selector: "[name=streetAddress1]",
			limit: 40,
			country: ["us", "ca"]
		},
		_streetAddress2: {
			selector: "[name=streetAddress2]",
			limit: 40,
			country: ["us", "ca"]
		},
		_city: {
			selector: "[name=locality]",
			limit: 30,
			country: ["us", "ca"]
		},
		_postalCode: {
			selector: "[name=postalCode]",
			limit: 10, // 9 digits plus hyphen
			country: ["us"]
		},
		_postalCode_Ca: {
			selector: "[name=postalCode]",
			country: ["ca"]
		},
		_phone: {
			selector: "[name=phone]",
			limit: 10,
			country: ["us", "ca"]
		},
		_ext: {
			selector: "[name=ext]",
			limit: 6,
			country: ["us", "ca"]
		},
		_phone2: {
			selector: "[name=phone2]",
			limit: 10,
			country: ["us", "ca"]
		},
		_ext2: {
			selector: "[name=ext2]",
			limit: 6,
			country: ["us", "ca"]
		},
		_upcCode: {
			selector: "[name=upcCode]",
			limit: 12,
			country: ["us", "ca"]
		},
		_upcCodeDetails: {
			selector: "[name=upcCodeDetails]"
		},
		_manufactoringCode: {
			selector: "[name=manufacturingCode]",
			limit: 50,
			country: ["us", "ca"]
		},
		_manufactoringCodeDetails: {
			selector: "[name=manufacturingCodeDetails]"
		},
		_store: {
			selector: "[name=storeNamePurchasedLocation]",
			limit: 50,
			country: ["us", "ca"]
		},
		_comments: {
			selector: "[name=comments]",
			limit: 1000,
			country: ["us", "ca"]
		}
	};

	var bindAll;

	var api = {
		onRegister: function(scope) {
			bindAll = bindAll || this.external.bindAll;
			new FormEmailUs(scope.$scope);
		}
	};

	function FormEmailUs($el) {
		this.$el = $el;
		bindAll(this);
		this.init();
	}

	FormEmailUs.prototype = {
		init: function() {
			this.bindDOM();
			this.bindEvents();
			this.getCountry();
			this.setMaxLength();
			this.createMandatoryMark();
		},

		onClickTitle: function($e) {
			if ($e.which === KEYS.ENTER || $e.type === "click") {
				this.$el.find(refs._title.selector).toggleClass(_active);
				this.$el.find(refs._content.selector).toggleClass(_active);
			}
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
			this.$title = this.$el.find(refs._title.selector).attr("tabindex","0");
			this.$upcCode = this.$el.find(refs._upcCode.selector);
			this.$upcCodeLabel = this.findLabel(this.$upcCode);
			this.$upcCodeDetails = this.$el.find(refs._upcCodeDetails.selector);
			this.$upcCodeDetailsLabel = this.findLabel(this.$upcCodeDetails);
			this.$manufactoringCode = this.$el.find(refs._manufactoringCode.selector);
			this.$manufactoringCodeLabel = this.findLabel(this.$manufactoringCode);
			this.$manufactoringCodeDetails = this.$el.find(refs._manufactoringCodeDetails.selector);
			this.$manufactoringCodeDetailsLabel = this.findLabel(this.$manufactoringCodeDetails);
			this.$inquiryType = this.$el.find(refs._inquiryType.selector);
			this.$country = this.$el.find(refs._country.selector);
		},

		findLabel: function($item) {
			return $item.closest(".selectField, .textField, .form-element, .component").find(".control-label");
		},

		bindEvents: function() {
			this.$title.on("click keypress", this.onClickTitle);
			this.$upcCodeDetails.on("change", this.onUpcCodeDetailsChange.bind(this));
			this.$manufactoringCodeDetails.on("change", this.onManufactoringCodeDetailsChange.bind(this));
			this.$inquiryType.on("change", this.onInquiryTypeChange.bind(this));
		},

		createMandatoryMark: function() {
			this.$mandatoryMark = $("<span class=\"required\">*</span>");
		},

		makeFieldMandatory: function($field, $label) {
			if ($label.find("span.required").length < 1) {
				this.$mandatoryMark.clone().appendTo($label);
			}
			$field.attr("required", true);
		},

		makeFieldNotMandatory: function($field, $label) {
			var $required = $label.find("span.required");
			$required.remove();
			$field.attr("required", false);
		},

		onUpcCodeDetailsChange: function() {
			var value = this.$upcCodeDetails.val();

			if (value === "Full") {
				this.makeFieldMandatory(this.$upcCode, this.$upcCodeLabel);
			} else {
				this.makeFieldNotMandatory(this.$upcCode, this.$upcCodeLabel);
			}
		},

		onManufactoringCodeDetailsChange: function() {
			var value = this.$manufactoringCodeDetails.val();

			if (value === "Full" || value === "Partial") {
				this.makeFieldMandatory(this.$manufactoringCode, this.$manufactoringCodeLabel);
			} else {
				this.makeFieldNotMandatory(this.$manufactoringCode, this.$manufactoringCodeLabel);
			}
		},

		onInquiryTypeChange: function() {
			var value = this.$inquiryType.val();

			if (value === "Product Concern") {
				this.makeFieldMandatory(this.$upcCodeDetails, this.$upcCodeDetailsLabel);
				this.makeFieldMandatory(this.$manufactoringCodeDetails, this.$manufactoringCodeDetailsLabel);
			} else {
				this.makeFieldNotMandatory(this.$upcCodeDetails, this.$upcCodeDetailsLabel);
				this.makeFieldNotMandatory(this.$manufactoringCodeDetails, this.$manufactoringCodeDetailsLabel);
			}
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
		name: "formEmailUs",
		api: api,
		selector: ".email-us-form",
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});
})(Cog.jQuery(), _);
