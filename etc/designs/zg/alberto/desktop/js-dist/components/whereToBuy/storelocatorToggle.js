/*
 * This is a specific toggle for where to buy implementation that
 * considers the animation, element movement and calculations.
 * It uses the events dispatched by util.toggle from storelocator select button.
 */
(function($, _) {
	"use strict";

	function ToggleItem($holder, $form) {
		this.$holder = $holder;
		this.$form = $form;
		var step2Selector = [
			".storelocator-zipcode-wrapper",
			".storelocator-radius-wrapper",
			".storelocator-button-wrapper"
		].join(",");
		this.$step1 = this.$holder.find(".storelocator-product-size-wrapper");
		this.$step2 = this.$holder.find(step2Selector);

		bindAll(this);
		this.createArrow();
		this.bindEvents();
	}

	ToggleItem.prototype = {
		bindEvents: function() {
			this.$form.on("change", this.onChange);
			enquire.register("only screen and (max-width: " + breakpoints.maxTablet + "px)", {
				match: this.refresh,
				unmatch: this.refresh
			});
		},

		onChange: function() {
			this.checkSteps();
			this.refresh();
		},

		checkSteps: function() {
			if (this.$step1.find("input:checked").length) {
				this.$step2.addClass("active");
			}
		},

		refresh: function() {
			if (!this.$holder.hasClass("is-selected")) {
				return;
			}
			this.holderHeight = this.$holder.outerHeight();
			this.checkSteps();
			this.$holder.css({
				"margin-bottom": this.$form.outerHeight()
			});
			this.$form.css("top", idx(["top"], this.$holder.position()) + this.holderHeight);
			this.$arrow.css("left", idx(["left"], this.$holder.position()) + this.$holder.outerWidth() * 0.5);
		},

		reset: function() {
			this.$holder.css("margin-bottom", "");
		},

		createArrow: function() {
			this.$arrow = $("<div class='arrow'>");
			this.$form.find("form").append(this.$arrow);
		}
	};

	// static methods
	$.extend(ToggleItem, {
		instances: [],
		noop: function() {
			return this._noop || (this._noop = new ToggleItem($(""), $("")));
		},

		get: function(elm) {
			return this.instances.filter(function(inst) {
				return inst.$holder[0] === elm || inst.$form[0] === elm;
			})[0] || this.noop();
		},

		add: function($holder, $form) {
			var inst = this.get($holder);
			if (inst === this.noop()) {
				inst = new ToggleItem($holder, $form);
				this.instances.push(inst);
			}
			return inst;
		},

		reset: function() {
			this.instances.forEach(function(inst) {
				inst.reset();
			});
		},

		cleanup: function() {
			this.instances.length = 0;
		}
	});

	function StorelocatorToggle($holder, selectors) {
		this.$holder = $holder;
		this.selectors = $.extend({
			item: ".listing-item",
			storeLocatorForm: ".storelocator-form-wrapper"
		}, selectors);

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
		this.bindEvents();
	}

	StorelocatorToggle.prototype = {
		bindEvents: function() {
			Cog.addListener("toggle", "open", this.onToggle(function(elm) {
				$(elm).addClass("is-selected");
				ToggleItem.reset(); // todo: promise so animation can be applied
				ToggleItem.get(elm).refresh();
				_.defer(this.scroll.bind(this));
				if (firstRun) {
					// if user has filled in their postcode in the current session
					// the form will auto submit when a ean is present, if it's valid
					// (only when the page first loads)
					firstRun = false;
					_.defer(function() {
						Cog.fireEvent("storelocator", "submitCurrentIfValid");
					});
				}
			}.bind(this)));

			Cog.addListener("toggle", "close", this.onToggle(function(elm) {
				$(elm).removeClass("is-selected");
				ToggleItem.get(elm).reset();
			}));
		},

		scroll: function() {
			Scroller.goToElement(
				this.$holder.find(".box-store-locator-steps"),
				this.$holder.find(".storelocator-form-wrapper.is-active"));
		},

		moveElements: function() {
			ToggleItem.cleanup();
			var $items = this.$holder.find(this.selectors.item);
			$items.each(this.fn(function(i, elm) {
				var $elm = $(elm);
				var $form = $elm.find(this.selectors.storeLocatorForm);
				ToggleItem.add($elm, $form);
				$elm.after($form);
			}));
		},

		onToggle: function(fn) {
			return this.fn(function(e) {
				var $button = idx(["eventData", "$holder"], e);
				this.$holder.find(this.selectors.item).each(function(i, elm) {
					if ($.contains(elm, $button[0])) {
						fn(elm);
					}
				});
			});
		},

		get: function($elm) {
			return ToggleItem.get($elm);
		}
	};

	var bindAll, idx, breakpoints, Scroller, firstRun = true;
	var api = {
		// use init to make dependencies available to this module.
		init: function() {
			bindAll = this.external.bindAll;
			idx = this.external.idx;
			Scroller = this.external.Scroller;
			breakpoints = this.external.breakpoints;
		}
	};

	Cog.registerStatic({
		name: "whereToBuy.storelocatorToggle",
		api: api,
		sharedApi: StorelocatorToggle,
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		},{
			name: "utils.idx",
			apiId: "idx"
		}, {
			name: "utils.breakpoints",
			apiId: "breakpoints"
		},{
			name: "whereToBuy.scroller",
			apiId: "Scroller"
		}]
	});

})(Cog.jQuery(), _);
