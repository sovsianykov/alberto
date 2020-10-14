(function() {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;

	function TagList($el) {
		this.$el = $el;
		this.$tagLinks = this.$el.find(".taglist-tag-link");
		this.position = analyticsUtils.getComponentPosition(this.$el);

		this.bindUIEvents();
	}

	TagList.prototype = {
		bindUIEvents: function() {
			this.$tagLinks.on("click", function(e) {
				Cog.fireEvent("tagList", analyticsDef.CLICK.TAGS_CLICK, {
					tagName: $(e.target).text(),
					componentPosition: this.position
				});
			}.bind(this));
		}
	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;

		new TagList(scope.$scope);
	};

	Cog.registerComponent({
		name: "tagList",
		api: api,
		selector: ".taglist",
		requires: [{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
			{
				name: "analytics.utils",
				apiId: "utils"
			}]
	});
})();
