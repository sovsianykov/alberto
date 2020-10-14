/**
 * Extended text area validation
 * Requires at least two non-whitespace characters
 */

(function($) {
	"use strict";

	var api = {};

	function TextAreaExtendedValidation($textAreaWrapper) {
		this.$textArea = $textAreaWrapper.find("textarea");
		this.$componentContent = $textAreaWrapper.children(".component-content");
		this.setUpErrorMessage();
		this.bindUIEvents();
	}

	TextAreaExtendedValidation.prototype = {
		setUpErrorMessage: function() {
			var errorMessageText = this.$componentContent.data("required-error-message");

			this.$errorMessage = this.$componentContent.children("error-msg");

			if (!this.$errorMessage.length) {
				this.$errorMessage = $("<span class=\"error-msg\">")
					.text(errorMessageText)
					.appendTo(this.$componentContent);
			}
		},
		bindUIEvents: function() {
			this.$textArea.bind("blur", function() {
				var value = this.$textArea.val();

				if (value.trim().length < 2) {
					this.$componentContent.addClass("error");
					this.$errorMessage.addClass("active");
				} else {
					this.$componentContent.removeClass("error");
					this.$errorMessage.removeClass("active");
				}
			}.bind(this));
		}
	};

	api.onRegister = function(scope) {
		var $textAreaWrapper = scope.$scope;

		new TextAreaExtendedValidation($textAreaWrapper);
	};

	Cog.registerComponent({
		name: "textAreaExtendedValidation",
		api: api,
		selector: ".textArea--extended-validation"
	});
})(Cog.jQuery());
