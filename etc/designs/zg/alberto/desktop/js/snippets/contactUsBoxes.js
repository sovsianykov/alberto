(function($) {
	"use strict";

	var api = {};
	var $placeholder = $("[class*='contact-tile--']");

	function ContactUsBoxes($contactUsBoxes) {
		this.$contactUsBoxes = $contactUsBoxes;
		this.$tilesHolder = this.$contactUsBoxes.find(".tiles-holder");
		this.$tile = this.$tilesHolder.find($placeholder);

		this.$tile.on("click", function() {
			var $link = $(this).find("a").last();

			window.location.href = $link.attr("href");
		});
	}

	api.onRegister = function(scope) {
		new ContactUsBoxes(scope.$scope);
	};

	// Trim comments textarea field
	// on submiting the form
	// made for preventing sending the form with blank
	// comments field
	var contactUsSubmitButton = $(".wrapper-contact-us button[type='submit']");

	contactUsSubmitButton.on("click", function() {
		var textarea = $(".wrapper-contact-us textarea");
		var textareaValue = $(textarea).val().trim();
		textarea.val(textareaValue);
	});

	Cog.registerComponent({
		name: "contact-us-boxes",
		api: api,
		selector: ".composite-contact_us_boxes"
	});
})(Cog.jQuery());
