/**
 * recipeToBasket - desktop/js/components/recipeToBasket.js
 */
(function() {
	"use strict";

	var api = {};
	var analyticsDef;
	var analyticsUtils;

	function RecipeToBasket($el) {
		this.$el = $el;
		this.$button = this.$el.find(".atml-button");
		this.$scrambledConfig = this.$el.find(".scrambled-config").data("config");
		this.position = analyticsUtils.getComponentPosition(this.$el);

		if (typeof this.$scrambledConfig !== "undefined") {
			this.bindUIEvents();
			//Initialize Scrambled script
			var scrambledScript = document.createElement("script");
			scrambledScript.setAttribute("src", this.$scrambledConfig.scriptPath);
			document.body.appendChild(scrambledScript);
		}
	}

	RecipeToBasket.prototype.bindUIEvents = function() {
		var recipeData = {
			EAN: this.$scrambledConfig.recipeId,
			shortTitle: document.title
		};
		this.$button.on("click", function() {
			Cog.fireEvent("recipe", analyticsDef.CLICK.RECIPE_TO_BASKET, {
				componentPosition: this.position,
				eventLabel: recipeData.shortTitle,
				productData: recipeData
			});
		}.bind(this));
	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;

		new RecipeToBasket(scope.$scope);
	};

	Cog.registerComponent({
		name: "recipeToBasket",
		api: api,
		selector: ".recipeToBasket",
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
