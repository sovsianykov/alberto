(function($) {
	"use strict";

	var api = {};
	var eventsDefinition = {};
	var analyticsUtils = {};
	var breakpoints;
	var maxlength;
	var ops = {
		selectors: {
			TOGGLE_STATE: ".js-modal-toggle-state",
			FOCUS_ELEMENT: "input",
			VISIBLE: ":visible"
		},
		classes: {
			IS_HIDDEN: "is-hidden",
			IS_CLOSING: "is-closing",
			BODY_OPEN: "has-open-modal"
		},
		animation: {
			CLOSE_DELAY: -1 // set to -1 to find animation duration from CSS.
		}
	};
	var KEYS = {
		esc: 27
	};
	var $body;

	function Mobal($el) {
		this.$el = $el;
		$body = $("body");

		this.bindUIEvents();
	}

	Mobal.prototype = {
		bindUIEvents: function() {

			this.$el.on("click", ops.selectors.TOGGLE_STATE, function() {
				this.toggleState();
			}.bind(this));

			$body.on("keyup", function(event) {
				if (event.keyCode === KEYS.esc) {
					this.closeModalIfOpen();
				}
			}.bind(this));

			maxlength.showRemainingCount({
				$root: this.$el
			});
		},
		closeModalIfOpen: function() {
			if (this.$el.is(ops.selectors.VISIBLE)) {
				this.toggleState();
			}
		},
		toggleState: function() {
			if (this.$el.hasClass(ops.classes.IS_CLOSING)) {
				// do nothing, ignore clicks while closing
				return;
			} else if (this.$el.is(ops.selectors.VISIBLE)) {
				this.close();
			} else {
				this.open();
			}
		},
		open: function() {
			this.$el.removeClass(ops.classes.IS_HIDDEN);
			this.$el.attr("aria-hidden", "false");
			$body.addClass(ops.classes.BODY_OPEN);
			_.defer(function() {
				// set focus on first element found with the FOCUS_ELEMENT selector
				this.$el.find(ops.selectors.FOCUS_ELEMENT).first().focus();
			}.bind(this));
		},
		close: function() {
			this.$el.addClass(ops.classes.IS_CLOSING);
			this.$el.attr("aria-hidden", "true");
			$body.removeClass(ops.classes.BODY_OPEN);
			window.requestAnimationFrame(function() {
				if (ops.animation.CLOSE_DELAY === -1) {
					this.setCloseDelay();
				}
				setTimeout(function() {
					// remove after CSS transition
					this.$el.removeClass(ops.classes.IS_CLOSING);
					this.$el.addClass(ops.classes.IS_HIDDEN);
				}.bind(this), ops.animation.CLOSE_DELAY);
			}.bind(this));
		},
		setCloseDelay: function() {
			// this gets called if the CLOSE_DELAY has been set to -1
			// setting CLOSE_DELAY to any other value will override this
			// e.g. to not have any delay set CLOSE_DELAY to 0
			var durationString = this.$el.css("animation-duration") || "";
			var duration = 0;
			if (_.endsWith(durationString, "ms")) {
				duration = parseInt(durationString, 10);
			} else if (_.endsWith(durationString, "s")) {
				duration = parseFloat(durationString, 10);
				duration = duration * 1000;
			}
			ops.animation.CLOSE_DELAY = duration;
		}
	};

	api.onRegister = function(scope) {
		analyticsUtils = this.external.utils;
		eventsDefinition = this.external.eventsDefinition;
		breakpoints = this.external.breakpoints;
		maxlength = this.external.maxlength;
		new Mobal(scope.$scope);
	};

	Cog.registerComponent({
		name: "modal",
		api: api,
		selector: ".modal",
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			},
			{
				name: "utils.breakpoints",
				apiId: "breakpoints"
			},
			{
				name: "utils.maxlength",
				apiId: "maxlength"
			}
		]
	});
}(Cog.jQuery()));
