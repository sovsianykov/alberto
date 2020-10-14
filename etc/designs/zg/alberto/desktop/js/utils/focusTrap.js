(function($) {
	"use strict";

	var keys = {
		esc: 27,
		tab: 9
	};
	var focusablesSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';

	function focusTrap($el, $firstElementToFocus) {
		var $firstFocusableEl;
		var $lastFocusableEl;

		setUpFocusables();
		setFocusOnFirstElement();
		attachEvents();

		function setUpFocusables() {
			var $focusableElems = $el.find(focusablesSelector).filter(':not([type="hidden"])');

			$firstFocusableEl = $focusableElems.get(0);
			$lastFocusableEl = $focusableElems.get(-1);
		}

		function setFocusOnFirstElement() {
			if (typeof $firstElementToFocus !== "undefined") {
				$firstElementToFocus.focus();
			} else {
				$firstFocusableEl.focus();
			}
		}

		function attachEvents() {
			$("body").on("keydown", function(event) {
				if (event.keyCode === keys.tab) {
					setUpFocusables();
					if (event.target === $lastFocusableEl && !event.shiftKey) {
						event.preventDefault();
						$firstFocusableEl.focus();
					} else if (event.target === $firstFocusableEl && event.shiftKey) {
						event.preventDefault();
						$lastFocusableEl.focus();
					}
				}
			});
		}
	}

	Cog.registerStatic({
		name: "utils.focusTrap",
		api: {},
		sharedApi: {
			focusTrap: focusTrap
		}
	});
}(Cog.jQuery()));
