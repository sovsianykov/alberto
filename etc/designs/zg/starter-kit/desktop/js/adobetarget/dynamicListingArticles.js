/**
 * Dynamic listing Article  switching from external source
 */
(function() {
	"use strict";

	var api = {};
	var targetHandler;
	var runmodeUtil;

	var SELECTORS = {
		LISTING_ITEM: ".listing-item"
	};

	function DynamicListingArticles($el) {
		this.$el = $el;
		this.init();
		if ("targetRecommendations" in window && targetRecommendations.articles) {
			var articleSnippetPath = window.target.articleSnippetPath;
			targetHandler.getRecommendationsReady(targetRecommendations.articles.articles, articleSnippetPath, "articles");
		}
	}

	DynamicListingArticles.prototype = {
		init: function() {
			this.refreshItems();
			targetHandler.getRecommendations(
				this.onRecommendationsSuccess.bind(this),
				this.onRecommendationError.bind(this)
			);
		},

		onRecommendationsSuccess: function(data) {
			if (data && data.errors && data.errors.length) {
				console.log("Unable to fetch data from target");
				return;
			}
		},

		onRecommendationError: function() {
			if (runmodeUtil.isAuthor()) {
				console.log("Unable to fetch data from target");
			}
		},
		refreshItems: function() {
			this.$items = this.$el.find(SELECTORS.LISTING_ITEM);
		}

	};

	api.onRegister = function(scope) {
		targetHandler = this.external.targetHandler;
		runmodeUtil = this.external.runmodeUtil;
		new DynamicListingArticles(scope.$scope);
	};

	Cog.registerComponent({
		name: "listingDynamicArticles",
		api: api,
		selector: ".listing--dynamicArticles",
		requires: [{
				name: "target.handler",
				apiId: "targetHandler"
			},
			{
				name: "utils.status",
				apiId: "runmodeUtil"
			}
		]
	});
})(Cog.jQuery());
