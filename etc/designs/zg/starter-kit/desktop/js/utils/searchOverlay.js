/**
 * Utils - Overlay
 */
(function($) {
	"use strict";
	var api = {},
		overlayContainer,
		overlayContentInner,
		overlayClose,
		mobileChecked = false,
		mobile = false,
		searchOpen = false,
		keys = {
			esc: 27,
			enter: 13
		},
		headerSearchInput = $(".searchBox input.search-query");
	var SELECTORS = {
		barScanScript: "barcode-js-lazyLoad",
		searchOverlayContent: ".search-overlay .overlay-content",
		overlayClose: ".overlay-close",
		barScan: ".barcodescan"
	};

	function SearchOverlay(elem, external) {
		this.obj = elem;
		this.url = external.url;
		this.focusTrap = external.focusTrap.focusTrap;
		this.properties = {
			"href": $(elem).attr("action")
		};
	}
	SearchOverlay.prototype.attachEvents = function() {
		var self = this,
			url = self.properties.href;
		if (!mobile) {
			url = this.url.setSelector(url, "lightbox");
		}
		$(self.obj).on("click", function(event) {
			if (searchOpen) {
				return;
			}
			searchOpen = true;
			event.preventDefault();
			event.stopPropagation();
			if (!mobile) {
				self.initOverlayContainer();
				self.showLoadingContainer();
			}
			$.ajax({
				type: "GET",
				url: url,
				dataType: "html",
				success: function(response) {
					self.overlayBuilder(response);
					Cog.init({
						$element: overlayContentInner
					});
				}
			});
		});
		$("body")
			.on("click touchstart", ".overlay-content", function(event) {
				event.stopPropagation();
			})
			.on("click touchstart", ".overlay-background, .overlay-container, .overlay-close", function() {
				if (searchOpen) {
					self.hideOverlay();
				}
			})
			.on("keydown", function(event) {
				if (event.keyCode === keys.esc || (event.keyCode === keys.enter && $(event.target).hasClass(SELECTORS.overlayClose))) {
					self.hideOverlay();
				}
			});
	};
	SearchOverlay.prototype.barCodeEnabled = function() {
		return document.getElementById(SELECTORS.barScanScript);
	};
	SearchOverlay.prototype.initOverlayContainer = function() {
		if (!overlayContainer) {
			var body = $("body"),
			overlayContainerHtml = "<div class='overlay-container search-overlay'>" +
			"<div class='overlay-content'>" +
			"<div tabindex='0' class='overlay-close'></div>" +
			"<div class='overlay-loading'></div>" +
			"<div class='overlay-content-inner'></div>" +
			"</div>" +
			"</div>";
			body.append(overlayContainerHtml);
			overlayContainer = $(".overlay-container");
			overlayContentInner = $(".overlay-content-inner");
			overlayClose = $(".overlay-close");
		} else {
			overlayContentInner.empty();
		}
		overlayContainer.hide();
	};
	SearchOverlay.prototype.showLoadingContainer = function() {
		overlayContainer.show();
	};
	SearchOverlay.prototype.overlayBuilder = function(response) {
		var self = this;
		if (mobile) {
			window.open(self.properties.href, "_blank");
		} else {
			self.showOverlay(response);
		}
	};
	SearchOverlay.prototype.showOverlay = function(response) {
		overlayClose.show();
		overlayContentInner.append(response);
		overlayContainer.fadeIn();
		$("html").addClass("overlay-open");
		this.focusTrap(overlayContainer, overlayContainer.find(".search-query"));
		var headerSearchInputValue = headerSearchInput.val().trim();
		var searchOverlayInput = $(".overlay-container .searchBoxWithSuggestions input.search-query");
		if (headerSearchInputValue) {
			searchOverlayInput.val(headerSearchInputValue);
		}
	};
	SearchOverlay.prototype.hideOverlay = function() {
		if (searchOpen) {
			overlayContainer.fadeOut();
			searchOpen = false;
			$("html").removeClass("overlay-open");
			Cog.fireEvent("overlay", "close");
			if (this.barCodeEnabled()) {
				Cog.fireEvent("barcodeScan", "BAR_CODE_SCAN_RESET");
			}
		}
	};

	function checkMobile() {
		var device = Cog.Cookie.read("device-group");
		return (device === "mobile");
	}
	api.onRegister = function(elements) {
		var self = this;
		if (!mobileChecked) {
			mobile = checkMobile();
			mobileChecked = true;
		}
		elements.$scope.each(function() {
			var search = new SearchOverlay(this, self.external);
			search.attachEvents();
		});
	};
	Cog.registerComponent({
		name: "search-overlay",
		api: api,
		selector: ".header-main form.form-search",
		requires: [{
				name: "utils.url",
				apiId: "url"
			},
			{
				name: "utils.focusTrap",
				apiId: "focusTrap"
			}
		]
	});
})(Cog.jQuery());
