(function($) {
	"use strict";

	var api = {};
	var objectFit;
	var CLASSES = {
		preventDefaultAnchorTag: "prevent-default-box"
	};

	var ATTRIBUTES = {
		href: "href"
	};

	var SELECTORS = {
		anchorTag: "a",
		divBoxElement: "div[class*='box']"
	};

	function ArticleList($articleList) {
		//triggerAnchorTag - flag used to stop multiple click events from being triggered
		var triggerAnchorTag = false;
		this.$articleList = $articleList;
		this.$itemWrapper = this.$articleList.find(".listing-item");
		this.$listingItem = this.$itemWrapper.find("> .component-content");

		this.$listingItem.on("click", function() {
			var $this = $(this),
				$link = $this.find(SELECTORS.anchorTag).last();
			triggerAnchorTag = true;
			$link.trigger("click");
		});

		this.$listingItem.find(SELECTORS.anchorTag).on("click", function(e) {
			var elementClassName;
			e.stopPropagation();
			elementClassName = e.currentTarget.closest(SELECTORS.divBoxElement).className;
			if (elementClassName.indexOf(CLASSES.preventDefaultAnchorTag) === -1) {
				window.location.href = $(this).attr(ATTRIBUTES.href);
			} else if (triggerAnchorTag) {
				triggerAnchorTag = false;
				e.currentTarget.click();
			}
		});

		objectFit.polyfill(this.$itemWrapper, ".image-small > .component-content");
	}

	api.onRegister = function(scope) {
		objectFit = this.external.objectFit;
		new ArticleList(scope.$scope);
	};

	Cog.registerComponent({
		name: "article-list",
		api: api,
		selector: ".listing-article-list",
		requires: [{
				name: "utils.objectFit",
				apiId: "objectFit"
			}
		]
	});
})(Cog.jQuery());
