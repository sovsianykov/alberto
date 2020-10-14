(function($) {
	"use strict";

	function PreventParentScroll($holder) {
		this.$holder = $holder;
		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);

		this.enable();
		this.bindEvents();
	}

	PreventParentScroll.prototype = {
		bindEvents: function() {
			this.$holder.on("mousewheel", this.onMouseWheel);
		},

		onMouseWheel: function(e) {
			if (!this.enabled || !this.checkScrollHeight()) {
				return;
			}

			var d = e.originalEvent.deltaY;
			var $elm = $(e.currentTarget);
			if (d < 0 && $elm.scrollTop() === 0) {
				e.preventDefault();
				return;
			}

			if (d > 0 && ($elm.scrollTop() === $elm[0].scrollHeight - $elm[0].offsetHeight)) {
				e.preventDefault();
			}
		},

		checkScrollHeight: function() {
			return this.$holder[0].scrollHeight > this.$holder[0].offsetHeight;
		},

		enable: function() {
			this.enabled = true;
		},

		disable: function() {
			this.enabled = false;
		}
	};

	var bindAll;
	var api = {
		// use init to make dependencies available to this module.
		init: function() {
			bindAll = this.external.bindAll;
		}
	};

	Cog.registerStatic({
		name: "utils.preventParentScroll",
		api: api,
		sharedApi: PreventParentScroll,
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});

})(Cog.jQuery());
