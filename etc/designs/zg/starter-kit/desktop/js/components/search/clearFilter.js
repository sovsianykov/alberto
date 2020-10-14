(function() {
	"use strict";
	function ClearFilter($el) {
		this.$el = $el;
		bindAll(this);
		this.init();
	}

	ClearFilter.prototype = {
		init: function() {
			var url = decodeURIComponent(window.location.href);
			var parent = this.$el.parents(".search-filters");
			if (url.indexOf("filters=") === -1) {
				parent.removeClass("has-filters");
			} else {
				parent.addClass("has-filters");
				this.$el.click(this.clearFilter);
			}
		},

		clearFilter: function() {
			var url = decodeURIComponent(window.location.href).split(/[?|&]+/);
			var finalUrl = (url.length > 1) ? url.shift() + "?" : url.shift();

			url.forEach(
				function(item) {
					if (item.indexOf("filters=") !== 0 && item !== "") {
						finalUrl+= item + "&";
					}
				}
			);

			finalUrl = finalUrl.substr(0, finalUrl.length - 1);
			window.location.replace(finalUrl);
		}
	};
	var bindAll;
	var api = {
		onRegister: function(scope) {
			bindAll = bindAll || this.external.bindAll;
			new ClearFilter(scope.$scope);
		}
	};
	Cog.registerComponent({
		name: "search.filter.ClearFilter",
		api: api,
		selector: ".button-clear-filters",
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});
})();

