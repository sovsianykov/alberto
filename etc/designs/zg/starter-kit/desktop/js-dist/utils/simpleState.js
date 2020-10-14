(function($) {
	"use strict";

	/*
	 * This class works as a simplified redux-like state controller
	 * where you can pass initial object and use Cog pubsub to dispatch
	 * (update state) and subscribe (listen to state change) without
	 * the need to have access to instance in all components that
	 * need to use it.
	 */

	var instances = {};

	function SimpleState(label, initial) {
		this.label = label;
		instances[this.label] = this;
		this.current = $.extend({}, initial);

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
		this.bindEvents();
	}

	SimpleState.prototype = {
		bindEvents: function() {
			Cog.addListener(this.label, "state:dispatch", this.onDispatch);
		},

		onDispatch: function(e) {
			Cog.fireEvent(this.label, "state:subscribe", $.extend(this.current, e.eventData));
		},

		getState: function() {
			return $.extend({}, this.current);
		}
	};

	SimpleState.create = function(label, initial) {
		return new SimpleState(label, initial);
	};

	SimpleState.getState = function(label) {
		return instances[label] ? instances[label].getState() : null;
	};

	var bindAll;
	var api = {
		// use init to make dependencies available to this module.
		init: function() {
			bindAll = this.external.bindAll;
		}
	};

	Cog.registerStatic({
		name: "utils.simpleState",
		api: api,
		sharedApi: SimpleState,
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});

})(Cog.jQuery());
