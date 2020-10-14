/**
 * turnto component
 */
(function($) {
	"use strict";

	var api = {};
	var componentSelector = ".turnto";
	var inaccurateSelector = ".TTflagAnswer";
	var seeQuestionSelector = ".TTseeQuestions";
	var utils;
	var eventsDef;
	var componentPosition;
	var turnToLazyLoadElement = document.getElementById("turnToLazyLoaded");

	function TurnTo($component) {
		var siteKey = $component.attr("tt-sitekey");
		var productId = $component.attr("tt-prodId");
		var widgetSrc = $component.attr("tt-widgetScript");
		var itemJsSrc = $component.attr("tt-itemJs");
		var locale = $component.attr("tt-locale");
		componentPosition = utils.getComponentPosition($component.parent());

		configureWidget(siteKey, productId);
		insertScript(widgetSrc);
		insertScript(itemJsSrc);
		addCustomEvents($component);

		function configureWidget(siteKey, productId) {
			//TurnTo widget constuction forces us to put these variables as global
			window.TurnToItemSku = productId;
			window.turnToConfig = {
				locale: locale,
				siteKey: siteKey,
				skipCssLoad: true,
				setupType: "dynamicEmbed",
				eventHandlers: {
					instantClick: questionClicked,
					questionSubmit: questionSubmitted,
					answerSubmit: answerSubmitted
				}
			};
		}

		function questionClicked() {
			Cog.fireEvent("turnto", eventsDef.CLICK.TURNTO_SEE_QUESTION, {
				position: componentPosition
			});
		}

		function questionSubmitted() {
			Cog.fireEvent("turnto", eventsDef.SUBMIT.TURNTO_QUESTION, {
				position: componentPosition
			});
		}

		function answerSubmitted() {
			Cog.fireEvent("turnto", eventsDef.SUBMIT.TURNTO_ANSWER, {
				position: componentPosition
			});
		}

		function addCustomEvents($component) {
			$component.on("click", inaccurateSelector, function() {
				Cog.fireEvent("turnto", eventsDef.CLICK.TURNTO_INACCURATE, {
					position: componentPosition
				});
			});
			$(seeQuestionSelector).on("click", function() {
				Cog.fireEvent("turnto", eventsDef.CLICK.TURNTO_TEASER_SEE_QUESTION, {
					position: componentPosition
				});
			});
		}

		function insertScript(widgetSrc) {
			$.getScript(widgetSrc);
		}
	}

	api.onRegister = function(scope) {
		utils = this.external.utils;
		eventsDef = this.external.eventsDefinition;

		if (!turnToLazyLoadElement) {
			new TurnTo(scope.$scope);
		} else if (turnToLazyLoadElement && document.readyState === "complete") {
			turnToLazyLoadElement.removeAttribute("id");
			new TurnTo(scope.$scope);
		} else {
			var load = function() {
				turnToLazyLoadElement.removeAttribute("id");
				new TurnTo(scope.$scope);
			};
			window.runOnWindowLoad(load);
		}
	};

	Cog.registerComponent({
		name: "turnto",
		api: api,
		selector: componentSelector,
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]

	});

})(Cog.jQuery());
