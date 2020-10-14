(function() {
	"use strict";

	function Breakpoints() {
		// leaving like this as this module used to return just an object with these values:
		this.sizes = {
			small: [null, 374],
			mobile: [375, 669],
			tablet: [670, 768],
			notebook: [767, 979],
			desktop: [1139, null]
		};
		this.sizeList = Object.keys(this.sizes);

		this.bindEvents();
	}

	Breakpoints.prototype = {
		capitalize: function(txt) {
			return txt.slice(0,1).toUpperCase() + txt.slice(1);
		},

		unit: function(val, template) {
			return !!val && template.replace("{}", val);
		},

		bindEvents: function() {
			this.sizeList.forEach(function(l) {
				var mqCurr = [
					"only screen",
					this.unit(this.sizes[l][0], "and (min-width: {}px)"),
					this.unit(this.sizes[l][1], "and (max-width: {}px)")
				].filter(function(val) {
					return !!val;
				}).join(" ");

				enquire.register(mqCurr, {
					match: this.updateData(l)
				});

				this["min" + this.capitalize(l)] = this.sizes[l][0];
				this["max" + this.capitalize(l)] = this.sizes[l][1];
			}.bind(this));
		},

		updateData: function(label) {
			return function() {
				this.current = label;

				// set over and under variables shortcuts. eg.: overMobile, underNodebook
				var selIndex = this.sizeList.indexOf(this.current);
				this.sizeList.forEach(function(l, i) {
					this["over" + this.capitalize(l)] = selIndex > i;
					this["under" + this.capitalize(l)] = selIndex < i;
				}.bind(this));
			}.bind(this);
		}
	};

	Cog.registerStatic({
		name: "utils.breakpoints",
		api: {},
		sharedApi: new Breakpoints()
	});
}());
