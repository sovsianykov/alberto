(function($) {
	"use strict";

	var api = {};
	var events;

	api.init = function() {
		events = this.external.eventsDefinition.SUBMIT;
	};

	function errorMsg($holder, data) {
		return $holder.data(data) || $holder.find("[data-" + data + "]").data(data);
	}

	var rules = (function() {
		var all = [];

		return {
			add: function(query, fn) {
				all.push({query: query, fn: fn});
			},
			err: function($elm) {
				var valid, err = [];

				$.each(all, function(i, rule) {
					if ($elm.is(rule.query) || $elm.find(rule.query).length) {
						valid = rule.fn($elm);
						if (valid.msg) {
							err.push(valid.msg);
						}
					}
				});

				return err;
			}
		};
	}());

	rules.add("[required],.g-recaptcha", function($holder) {
		var $field = $holder.find("input, select, textarea");
		var valid = (function() {
			if ($field.is("[type=checkbox]")) {
				return $field.is(":checked");
			} else if ($field.filter("[type=radio]").length > 0) {
				return $field.filter(":checked").length > 0;
			} else {
				return $field.val() !== "";
			}
		}());

		return valid || {
			msg: errorMsg($holder, "required-error-message")
		};
	});

	rules.add("[data-min-age]", function($holder) {
		var $input = $holder.find("input");
		var config = $input.data("min-age") || {
			minAge: 0,
			errorMessage: ""
		};
		var today = new Date();
		var required = $input.attr("required");
		var pickedValue = $input.data("pickadate").get("select");
		var val = (pickedValue || {}).obj || new Date();
		var age = today.getFullYear() - val.getFullYear();
		age = today.getMonth() - val.getMonth() < 0 || today.getDate() - val.getDate() < 0 ? (age - 1) : age;

		return (!required && !pickedValue) || (age >= config.minAge) || {
			msg: config.errorMessage.replace("{age}", config.minAge)
		};
	});

	rules.add("[pattern]", function($holder) {
		var $field = $holder.find("input");
		var regexp = new RegExp($field.attr("pattern"));
		return !$field.val().length || regexp.test($field.val()) || {
			msg: errorMsg($holder, "invalid-value-error-message")
		};
	});

	rules.add("[sizelimit]", function($holder) {
		var $field = $holder.find("input");
		var sizeLimit = $field.attr("sizelimit");
		var fileSize = $field[0].files[0].size / 1048576; // converts Bytes to MB
		var valid = (function() {
			if (fileSize > sizeLimit) {
				return {
					msg: errorMsg($holder, "invalid-value-error-message")
				};
			} else {
				return $field.val() !== "";
			}
		}());
		return valid;

	});

	function field($holder) {
		var $field = $holder.find("input, select, textarea");
		var $msg;

		function error(err) {
			$msg = $msg || $("<span class=\"error-msg\">");
			$msg.text(err[0]);
			$holder.addClass("error");
			$holder.append($msg);
			setTimeout(function() {
				$msg.addClass("active");
			}, 0);
		}

		function success() {
			$holder.removeClass("error");
			if ($msg) {
				$msg.removeClass("active");
			}
		}

		function check() {
			var err = rules.err($holder);
			(err.length ? error : success)(err);
			return !err.length;
		}

		$field.on("blur, change", function() {
			check();
		});

		return {
			$holder: $holder,
			$field: $field.eq(0),
			check: check
		};
	}

	function validator($form, fieldsQuery) {
		var fields = [];
		fieldsQuery = fieldsQuery || [];

		function isValid() {
			var err = fields.filter(function(fld) {
				return !fld.check();
			});

			if (err.length) {
				Cog.fireEvent("form", events.FORM_ERROR, {
					err: err
				});
				focusField(err[0].$field);
			}

			return !err.length;
		}

		function focusField($field) {
			if ($field.hasClass("datepicker-input")) {
				$field[0].scrollIntoView({
					block: "center"
				});
			} else {
				$field.focus();
			}
		}

		$form.find(fieldsQuery.join(",")).each(function(i, elm) {
			fields.push(field($(elm)));
		});

		$form.attr("novalidate", "");
		$form.on("submit", function() {
			if (!isValid()) {
				return false;
			}
		});
	}

	Cog.registerStatic({
		name: "utils.validator",
		api: api,
		requires: [{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		}],
		sharedApi: validator
	});
}(Cog.jQuery()));
