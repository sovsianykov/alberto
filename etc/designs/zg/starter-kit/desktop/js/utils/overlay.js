/**
 * Utils - Overlay
 */
(function($) {
	"use strict";

	var api = {},
		overlayContainer,
		overlayContent,
		overlayContentInner,
		overlayBackground,
		overlayClose,
		mobileChecked = false,
		mobile = false,
		classes = {
			searchOverlay: "search-overlay",
			searchOverlayTrigger: "search-overlay-trigger"
		},
		keys = {
			esc: 27
		};

	function Overlay(elem, external) {
		this.obj = elem;
		this.url = external.url;
		this.focusTrap = external.focusTrap.focusTrap;
		this.properties = {
			"href": $(elem).attr("href"),
			"width": $(elem).data("overlaywidth")
		};
	}

	Overlay.prototype.attachEvents = function() {
		var self = this,
			url = self.properties.href;

		if (!mobile) {
			url = this.url.setSelector(url, "lightbox");
		}

		$(self.obj).on("click", function(event) {
			event.preventDefault();
			event.stopPropagation();

			if (!mobile) {
				self.initOverlayContainer();
				self.showLoadingContainer();
			}

			self.visible = true;

			$.ajax({
				type: "GET",
				url: url,
				dataType: "html",
				success: function(response) {
					self.overlayBuilder(response);
					Cog.init({$element: overlayContentInner});
				}
			});
		});

		$("body")
			.on("click touchstart", ".overlay-content", function(event) {
				event.stopPropagation();
			})
			.on("click touchstart", ".overlay-background, .overlay-container, .overlay-close", function() {
				if (self.visible) {
					self.hideOverlay();
				}
			})
			.on("keydown", function(event) {
				if (event.keyCode === keys.esc) {
					self.hideOverlay();
				}
			});
	};

	Overlay.prototype.initOverlayContainer = function() {
		var body = $("body"),
			overlayBackgroundHtml = "<div class='overlay-background'></div>",
			overlayContainerHtml = "<div class='overlay-container'>" +
				"<div class='overlay-content'>" +
				"<div tabindex='0' class='overlay-close'></div>" +
				"<div class='overlay-loading'></div>" +
				"<div class='overlay-content-inner'></div>" +
				"</div>" +
				"</div>";

		if (!overlayContainer) {
			body.append(overlayBackgroundHtml, overlayContainerHtml);
			overlayBackground = $(".overlay-background");
			overlayContainer = $(".overlay-container");
			overlayContent = $(".overlay-content");
			overlayContentInner = $(".overlay-content-inner");
			overlayClose = $(".overlay-close");
		} else {
			overlayContentInner.empty();
		}

		if (this.isSearchOverlay()) {
			overlayBackground.hide();
		}
	};

	Overlay.prototype.showLoadingContainer = function() {
		if (!this.isSearchOverlay()) {
			overlayBackground.show();
		}
	};

	Overlay.prototype.overlayBuilder = function(response) {
		var self = this;
		var $response;

		if (mobile) {
			window.open(self.properties.href, "_blank");
		} else if (response.indexOf("<body") > 0 && response.indexOf("<div class=\"contentSnippet\">") > 0) {
			// we have received an entire page, check if it has a content snippet div
			$response = $(response);
			self.showOverlay($response.find(".contentSnippet .snippetContent").html());
		} else if (response.indexOf("<body") > 0 && response.indexOf("id=\"content\" class=\"main") > 0) {
			// we have received an entire page, check if it has a #content.main div
			$response = $(response);
			self.showOverlay($response.find("#content.main").html());
		} else {
			self.showOverlay(response);
		}
	};

	Overlay.prototype.showOverlay = function(response) {
		var overlayWidth = this.properties.width;

		if (this.isSearchOverlay()) {
			overlayContainer.addClass(classes.searchOverlay);
		}

		overlayClose.show();
		overlayContent.css({
			"width": "90%",
			"max-width": overlayWidth
		});
		overlayContentInner.append(response);
		overlayContainer.show();
		overlayContent.css({
			"top": -overlayContent.outerHeight() - 150,
			"opacity": 0
		});

		setTimeout(function() {
			$("html").addClass("overlay-open");
			overlayContent.show();
			overlayContent.animate({
				opacity: 1,
				top: "150px"
			}, 500, "linear");

			this.focusTrap(overlayContent, overlayContent.find(".search-query"));
		}.bind(this), 0);
	};

	Overlay.prototype.hideOverlay = function() {
		if (typeof overlayContent !== "undefined") {
			overlayContent.animate({
				top: -overlayContent.outerHeight() - 150,
				opacity: 0
			}, 500, "linear", function() {
				overlayBackground.fadeOut();
				overlayContainer.fadeOut();
				overlayContent.hide();
				overlayContainer.removeClass(classes.searchOverlay);
			});

			if (this.visible) {
				this.visible = false;
				$("html").removeClass("overlay-open");
				Cog.fireEvent("overlay", "close");

				this.obj.focus();
			}
		}
	};

	Overlay.prototype.isSearchOverlay = function() {
		return $(this.obj).hasClass(classes.searchOverlayTrigger);
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
			var overlay = new Overlay(this, self.external);
			overlay.attachEvents();
		});
	};

	Cog.registerComponent({
		name: "overlay",
		api: api,
		selector: "a.lightbox",
		requires: [
			{
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
