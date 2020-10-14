(function($) {
	"use strict";

	var api = {};
	var events;
	var utils;
	var ctConstants;

	api.init = function() {
		events = this.external.eventsDefinition.SUBMIT;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("form", events.FORM, formHandler);
			Cog.addListener("form", events.FORM_ERROR, formSubmitErrorHandler);
			Cog.addListener("form", events.SERVER_ERROR, formServerErrorHandler);
		}
	}

	function formHandler(event) {
		var eventAction = event.eventData.action || ctConstants.forms;
		utils.pushComponent("Form", event.eventData.componentPosition);
		utils.addTrackedEvent(eventAction, event.eventData.label);
	}

	function formSubmitErrorHandler(event) {
		var err = event.eventData.err || [];
		var labels = [];
		err.forEach(function(el) { // get the names of all elements that failed validation as a comma-separated string e.g. "email, postCode, birthDate"
			labels.push(getFormElementLabel(el));
		});
		formSumbitElementErrorHandler(labels.join("|"), $(err[0]).closest("form"));
	}

	function getFormElementLabel(el) {
		var label;
		try { // Should never happen, but don't throw error if there is unexpected input
			label = el.$field.attr("name") ||
				el.$field.attr("id") ||
				el.$holder.find("iframe[title]").attr("title") ||
				el.$holder.find("input[name], select[name], textarea[name]").attr("name");
		} catch (err) {}
		return label || "unknown element";
	}

	function formSumbitElementErrorHandler(label, $component) {
		utils.pushComponent("Form", utils.getComponentPosition($component), ctConstants.custom, "Error");
		utils.addTrackedEvent(ctConstants.inputerror, label, ctConstants.custom, "Error");
	}

	function formServerErrorHandler(event) {
		utils.pushComponent("Form", utils.getComponentPosition(event.eventData.$formElement), ctConstants.custom, "Error");
		utils.addTrackedEvent(ctConstants.serverError, event.eventData.errorMessage, ctConstants.custom, "Error");
	}

	Cog.register({
		name: "analytics.submitHandlers",
		api: api,
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
