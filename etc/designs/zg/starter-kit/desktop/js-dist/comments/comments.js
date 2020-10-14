(function($) {
	"use strict";

	var api = {};
	var selector = {
		productId: "meta[itemprop=productID]",
		recipeId: "meta[property='re:recipeId']",
		iframeSrcUrl: "div[data-iframe-src]",
		iframeAppendContainer: ".component-content"
	};

	var attributes = {
		pageIdValue: "content",
		iframeSrc: "data-iframe-src"
	};

	function Comments($el) {
		this.$el = $el;
		this.$productId = $(selector.productId);
		this.$recipeId = $(selector.recipeId);

		if (this.$productId.length > 0) {
			this.pageId = this.$productId.attr(attributes.pageIdValue);
		} else if (this.$recipeId.length > 0) {
			this.pageId = this.$recipeId.attr(attributes.pageIdValue);
		}

		this.$iframeSrc = this.$el.find(selector.iframeSrcUrl).attr(attributes.iframeSrc) + this.pageId;
		this.$el.find(selector.iframeAppendContainer).append("<iframe src='" + this.$iframeSrc + "' frameborder='0' allowfullscreen target='_parent'  width='100%' height='500px' > </iframe>");
	}

	api.onRegister = function(scope) {
		new Comments(scope.$scope);
	};

	Cog.registerComponent({
		name: "Comments",
		api: api,
		selector: ".comments"
	});

})(Cog.jQuery());
