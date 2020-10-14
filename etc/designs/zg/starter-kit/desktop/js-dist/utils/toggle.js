/*jshint -W024 */
(function($) {
	"use strict";

	function BodyEvent() {
		this.$body = $(document.body);

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
		this.bindEvents();
	}

	BodyEvent.prototype = {
		bindEvents: function() {
			this.$body.on("click", this.onClick);
		},

		onClick: function(e) {
			Cog.fireEvent("toggle", "body:close", {
				$elm: $(e.target)
			});
		}
	};

	// work as a "singleton"
	BodyEvent.single = function() {
		return (this.inst = this.inst || new BodyEvent());
	};

	function Toggle($holder, $target) {
		this.$holder = $holder;
		this.$target = $target;
		BodyEvent.single();

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
		this.bindEvents();
	}

	Toggle.prototype = {
		bindEvents: function() {
			this.$holder.on("click", this.onHolderClick);
			Cog.addListener("toggle", "body:close", this.onClose);
		},

		onHolderClick: function() {
			this.open();
		},

		onClose: function(e) {
			var elm = idx(["eventData", "$elm", 0], e);

			var avoidClose = [
				this.$holder[0] === elm,
				this.$target[0] === elm,
				$.contains(this.$holder[0], elm),
				$.contains(this.$target[0], elm)
			].reduce(function(a, b) {
				return a || b;
			}, false);

			if (!avoidClose) {
				this.close();
			}
		},

		open: function() {
			this.$target.addClass("is-active");
			Cog.fireEvent("toggle", "open", {
				$holder: this.$holder,
				$target: this.$target
			});
		},

		close: function() {
			this.$target.removeClass("is-active");
			Cog.fireEvent("toggle", "close", {
				$holder: this.$holder,
				$target: this.$target
			});
		}
	};

	var bindAll, idx;
	var api = {
		// use init to make dependencies available to this module.
		init: function() {
			bindAll = this.external.bindAll;
			idx = this.external.idx;
		}
	};

	Cog.registerStatic({
		name: "utils.toggle",
		api: api,
		sharedApi: Toggle,
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		},{
			name: "utils.idx",
			apiId: "idx"
		}]
	});

})(Cog.jQuery());
