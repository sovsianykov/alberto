(function($) {
	"use strict";
	function Accordion($el) {
		this.$el = $el;
		bindAll(this);
		this.init();
	}

	Accordion.prototype = {
		init: function() {
			this.$el.find(_title).click(this.onClickTitle);
		},
		onClickTitle: function(event) {
			var $title = $(event.currentTarget);
			var $content = $title.next(_content);
			var isActive = $content.hasClass(_active);

			this.$el.find("." + _active).removeClass(_active);

			if (!isActive) {
				$title.addClass(_active);
				$content.addClass(_active);
			}
		}
	};
	var _active = "is-active";
	var _content = ".js-accordion-content";
	var _title = ".js-accordion-title";
	var bindAll;
	var api = {
		onRegister: function(scope) {
			bindAll = bindAll || this.external.bindAll;
			new Accordion(scope.$scope);
		}
	};
	Cog.registerComponent({
		name: "search.filter.accordion",
		api: api,
		selector: ".search-filters",
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});
})(Cog.jQuery());

