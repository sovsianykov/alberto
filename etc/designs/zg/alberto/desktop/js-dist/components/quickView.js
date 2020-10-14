(function($) {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;
	var cache = {};
	var quickViewAdded = false;
	var keys = {
		esc: 27
	};
	var $body = $("body");
	var $opener;
	var shoppablePDPSelectors = {
		"closeButton": ".shoppable-item-close-button",
		"pdpContainer": "#shoppable_pdp_container",
		"quickviewContainer": ".quickview-container"
	};

	function ProductQuickView($el, focusTrap) {
		this.$el = $el;
		this.$button = this.$el.find(".quickview-btn");
		this.mainEan = this.$button.attr("data-quickviewean");
		this.currentEan = this.mainEan;
		this.snippetPath = this.$button.attr("data-quickviewsnippetpath");
		this.snippetRootPath = this.prepareSnippetMainPath(this.snippetPath);
		this.focusTrap = focusTrap.focusTrap;
		this.componentPosition = analyticsUtils.getComponentPosition(this.$el);
		this.$shopifyModal = this.$el.closest(".listing-item").find(".js-shopify-open-modal");
		this.bindEvents();
		this.bindVariantListener();
	}

	ProductQuickView.prototype = {
		bindEvents: function() {
			this.$button.on("click", function(event) {
				if (this.$shopifyModal.length) {
					// Shopify has a custom modal window for personalisation
					event.preventDefault();
					this.$shopifyModal.trigger("click:quickview");
					return;
				}
				if (!quickViewAdded) {
					this.initQuickView();
				}

				$opener = this.$button;
				this.mainEan = $(event.target).attr("data-quickviewean");
				this.snippetPath = $(event.target).attr("data-quickviewsnippetpath");
				this.wrapQuickViewMarkupElements();
				this.getData(this.mainEan);
				this.onClickAnalytics(this.mainEan);
			}.bind(this));

			$body.on("keydown", function(event) {
				if (event.keyCode === keys.esc) {
					if ($(shoppablePDPSelectors.pdpContainer).is(":visible") && $(shoppablePDPSelectors.quickviewContainer).hasClass("is-active")) {
						$(shoppablePDPSelectors.closeButton).trigger("click");
						this.focusTrap($(shoppablePDPSelectors.quickviewContainer));
					} else if ($(shoppablePDPSelectors.pdpContainer).is(":visible")) {
						$(shoppablePDPSelectors.closeButton).trigger("click");
					} else {
						this.closeOverlay();
					}
				}
			}.bind(this));

			this.$button.on("mouseover", function() {
				if ($opener) {
					$opener.trigger("blur");
				}
			});
		},

		initQuickView: function() {
			var $quickViewHtml = $("<div class=\"quickview-container\">" +
				"<button class=\"quickview-close\">X</button>" +
				"<div class=\"quickview-wrapper\">" +
				"<div class=\"quickview-content\"/>" +
				"<div/>" +
				"<div/>");
			var backgroundHtml = "<div class='quickview-background'/>";

			$quickViewHtml.find(".quickview-close").on("click", function() {
				this.closeOverlay();
			}.bind(this));

			$quickViewHtml.find(".quickview-content").data({
				mainEan: this.mainEan,
				currentEan: this.currentEan
			});
			if ($body.find(".quickview-container").length === 0) {
				$body.append(backgroundHtml).append($quickViewHtml);
			}
			quickViewAdded = true;
		},

		wrapQuickViewMarkupElements: function() {
			this.$container = $body.find(".quickview-container");
			this.$wrapper = this.$container.find(".quickview-wrapper");
			this.$content = this.$container.find(".quickview-content");
			this.$content.data({
				mainEan: this.mainEan
			});
		},

		getData: function() {
			if (typeof cache[this.snippetPath] === "undefined") {
				$.get(this.snippetPath, function(data) {
					if (typeof data !== "undefined") {
						cache[this.snippetPath] = $(data).find(".snippetContent").get(0).innerHTML;
						this.openOverlay();
					}
				}.bind(this));
			} else {
				this.openOverlay();
			}
		},

		openOverlay: function() {
			this.$content.html(cache[this.snippetPath]);
			Cog.init();
			Cog.fireEvent("quickView", "openOverlay");
			$body.addClass("has-open-quickView");
			this.$content.find(".productVariantList-link[href='#" + this.mainEan + "']").addClass("is-active");
			this.$container.addClass("is-active");
			$("html").addClass("overlay-open");
			this.focusTrap(this.$container);
			if ($(".buyitnow .pricespider").length > 0) {
				PriceSpider.rebind();
			}
		},

		closeOverlay: function() {
			if (typeof this.$container !== "undefined" && typeof this.$button !== "undefined" && $("html").hasClass("overlay-open")) {
				$("html").removeClass("overlay-open");
				$body.removeClass("has-open-quickView");
				if ($body.hasClass("has-open-modal")) {
					$body.removeClass("has-open-modal");
				}
				this.$container.removeClass("is-active");
				if ($opener) {
					$opener.trigger("focus");
				}
			}
		},

		onClickAnalytics: function(ean) {
			Cog.fireEvent("productQuickView", analyticsDef.CLICK.PRODUCT_QUICK_VIEW, {
				ean: ean,
				componentPosition: this.componentPosition
			});
		},

		prepareSnippetMainPath: function(path) {
			return path.substring(0, path.indexOf(this.mainEan));
		},

		prepareProductSnippetPath: function() {
			return this.snippetRootPath + this.mainEan + ".html";
		},

		prepareProductVariantSnippetPath: function() {
			return this.snippetRootPath + this.mainEan + "." + this.currentEan + ".html";
		},

		bindVariantListener: function() {
			Cog.addListener("variantList", "variantChanged", function(e) {
				if (this.isCurrentQuickView()) {
					this.setCurrentEan(e.eventData.ean);
					if (this.isMainProductEan(this.currentEan)) {
						this.snippetPath = this.prepareProductSnippetPath();
					} else {
						this.snippetPath = this.prepareProductVariantSnippetPath();
					}

					this.wrapQuickViewMarkupElements();
					this.getData(this.currentEan);
				}
			}.bind(this));
		},

		setCurrentEan: function(ean) {
			this.currentEan = ean;
			$(".quickview-content").data("currentEan", ean);
		},

		isCurrentQuickView: function() {
			return this.mainEan === $(".quickview-content").data("mainEan");
		},

		isMainProductEan: function(ean) {
			return this.mainEan === ean;
		}

	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		new ProductQuickView(scope.$scope, this.external.focusTrap);
	};

	Cog.registerComponent({
		name: "productQuickView",
		api: api,
		selector: ".productQuickView",
		requires: [
			{
				name: "utils.focusTrap",
				apiId: "focusTrap"
			},
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]
	});

})(Cog.jQuery());
