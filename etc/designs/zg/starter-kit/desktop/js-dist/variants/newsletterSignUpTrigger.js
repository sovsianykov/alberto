/**
 * Components - Popup window for triggering a sign-up encouraging popup
 */
(function($) {
	"use strict";

	var api = {};
	var cookieName = "newsletter-prompt-displayed";
	var newsletterTrigger = ".richText--newsletter-trigger";
	var popupLinkClass = "a.lightbox";
	var closeBtn = ".button-close";
	var overlayBackground = ".overlay-background";
	var overlay = ".overlay-container";
	var pageIndex = 1; // after how many page views should the popup be shown? (set 0 for first page)

	api.init = function() {
		var isAuthor = this.external.status.isAuthor(); //overlay does not show on edit mode
		var $richTextWithOverlay = $(newsletterTrigger);
		if (isAuthor) {
			$richTextWithOverlay.show();
		} else if (shouldDisplayPrompt()) {
			setPromptDisplayed();
			$richTextWithOverlay.find(popupLinkClass).trigger("click");
			$(overlayBackground).addClass("newsletter-overlay");
			$(overlay).first().attr("class", "newsletter-container");
			$("body").on("click", closeBtn, closeOverlay);
		}
	};

	function closeOverlay(e) {
		e.preventDefault();
		setPromptDisplayed();
		$(closeBtn).closest(".newsletter-container").fadeOut();
		$(overlay).removeClass("newsletter-container");
		$(overlayBackground).fadeOut().removeClass("newsletter-overlay");
	}

	function setPromptDisplayed() {
		// set cookie value to "true", this will prevent the popup from being shown again
		Cog.Cookie.create(cookieName, "seen");
	}

	function shouldDisplayPrompt() {
		var shouldShow = false;
		var state = Cog.Cookie.read(cookieName);

		if (state === "seen") {
			// newsletter prompt has been shown already
			return false;
		} else if (!state) {
			// first visit to site
			state = 0;
			Cog.Cookie.create(cookieName, state.toString());
		} else if (!isNaN(parseInt(state, 10))) {
			// subsequent visit, value is an int so increment
			state = parseInt(state, 10);
			if (sessionStorage.getItem("newsletter.currentPage") !== location.pathname) {
				// check it's not a page refresh, if not increment
				state = state + 1;
			}
			Cog.Cookie.create(cookieName, state.toString());
		}
		if (state >= pageIndex) {
			sessionStorage.removeItem("newsletter.currentPage");
			shouldShow = true;
		} else {
			sessionStorage.setItem("newsletter.currentPage", location.pathname);
		}
		return shouldShow;
	}

	Cog.register({
		name: "newsletter-sign-up-trigger",
		api: api,
		selector: newsletterTrigger,
		requires: [
			{
				name: "utils.status",
				apiId: "status"
			}
		]
	});

})(Cog.jQuery());
