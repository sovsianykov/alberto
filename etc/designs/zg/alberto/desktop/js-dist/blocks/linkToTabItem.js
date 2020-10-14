(function($, console) {
	"use strict";

	var api = {};
	var querystring;
	var bindAll;
	var triggeredLink;
	var $body = $("body");
	console = console || {
		log: function() {}
	};
	var reviewToProductPage = function() {
		// after submitting a review
		// the user should be taken to the product page
		// do this if;
		//		the close button was clicked when
		//			there is a bv container
		//			there is a bv form with productid
		//			the bv Thank You page is visible
		//			and there is link to review tab
		$body.on("mouseup", ".bv-mbox-close", function(e) {
			var $mbox = $(e.target).closest(".bv-mbox");
			var productid = $(".bv-form input[name=\"productid\"]").val();
			var href = $("[data-bv-product-id=\"" + productid + "\"]").find("[data-tab-item=\"tab-item-reviews\"]").attr("href");
			if ($mbox.length && $mbox.find(".bv-mbox-current .bv-submission-thankyou").length === 1 && href) {
				// User is closing the Thank You panel and a link to review tab was was found
				location.href = href;
			}
		});
	};

	reviewToProductPage();

	function LinkToTabItem($el) {
		this.options = {
			retryMax: 48,
			retryDelay: 250
		};
		this.relocateTimer = null;
		this.retryCount = 0;
		this.$el = $el;
		this.$link = this.$el.find(".link-to-tab-item");
		this.destinationClass = this.$link.data("tab-item");
		this.$destinationTabItem = [];
		try {
			this.$destinationTabItem = $(".tabs .tabMenuItem." + this.destinationClass);
		} catch (e) {
			console.log("content error:", this.destinationClass, e);
		}

		this.qs = querystring.getFromQueryString("tab-item");

		bindAll(this);

		this.relocateTimer = setTimeout(this.relocateElement, 0);

	}

	LinkToTabItem.prototype = {
		init: function() {
			if (this.$destinationTabItem.length) {
				this.bindEvents();
				this.checkQureystring();
			} else {
				this.linkToTabItem();
			}
		},
		relocateElement: function() {
			clearTimeout(this.relocateTimer);
			var $ratings = this.$el.parent().find(".ratingsandreviews");
			var $buttonsWrapper = this.getButtonsWrapper($ratings);
			var $clone;

			if ($buttonsWrapper.length) {
				$clone = this.$el.clone();
				$clone.appendTo($buttonsWrapper).show();
				this.$el.remove();
				this.$link = $clone.find(".link-to-tab-item");
				this.init();
			} else if (this.retryCount < this.options.retryMax) {
				this.retryCount = this.retryCount + 1;
				this.relocateTimer = setTimeout(this.relocateElement, this.options.retryDelay);
			}
		},
		getButtonsWrapper: function($ratings) {
			var $type = !!$ratings.children(".bazaarvoice").length;

			if ($type) {
				return $ratings.find(".bv_main_container_row_flex").last();
			} else {
				return [];
			}
		},
		scrollToTabItem: function() {
			this.scrollTo({$el: this.$destinationTabItem});
			this.$destinationTabItem.trigger("click");
		},
		linkToTabItem: function() {
			var url = this.$link.attr("href");
			var tabParam = "tab-item=" + this.destinationClass;
			if (url && url !== "#") {
				if (url.indexOf("?") === -1) {
					url = url + "?" + tabParam;
				} else {
					url = url + "&" + tabParam;
				}
				this.$link.attr("href", url);
			}
		},
		bindEvents: function() {
			this.$link.on("click", this.scrollToTabItem.bind(this));
		},
		scrollTo: function(ops) {
			var $el = ops.$el;
			var scroll = $el.offset().top - (ops.offset || 10);
			var callback = ops.callback || function() {};
			$("html, body").animate({
				scrollTop: scroll
			}, (ops.duration || 700), callback);

		},
		checkQureystring: function() {
			// allow deep linking to review tabs
			// usage
			// path/page.html?tab-item=tab-item-questions-answers
			// if querystring param 'tab-item' matches a destination class then
			// trigger the link and scroll to the destination
			if (this.qs && this.qs === this.destinationClass && !triggeredLink) {
				// prevent future instances from repeating this action
				triggeredLink = true;
				var self = this;
				self.$destinationTabItem.trigger("click");
				// page is loading, defer the scroll a bit
				// it will NOT be smooth due to all the
				// concurrent loading assets etc...
				_.defer(function() {
					self.$destinationTabItem.closest(".tabs-nav").attr("id", self.qs);
					self.scrollTo({
						$el: self.$destinationTabItem,
						duration: 1000,
						callback: function() {
							// set the location hash
							location.hash = self.qs;
						}});
				}, 3000);
			}
		}
	};

	api.onRegister = function(scope) {
		bindAll = bindAll || this.external.bindAll;
		querystring = querystring || this.external.querystring;
		new LinkToTabItem(scope.$scope);
	};

	Cog.registerComponent({
		name: "linkToTabItem",
		api: api,
		selector: ".reference-link_to_tab_item",
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		},{
			name: "utils.querystring",
			apiId: "querystring"
		}]
	});
})(Cog.jQuery(), window.console);
