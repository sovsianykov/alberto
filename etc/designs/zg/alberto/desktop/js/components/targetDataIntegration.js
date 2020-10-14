/**
 * Target data integration component
 */
(function() {
	"use strict";
	var api = {};
	var targetHandler;

	api.init = function() {
		if (typeof mboxArgs !== "undefined") {
			targetHandler = this.external.targetHandler;
			targetHandler.safeCreateMbox({
				elementId: "recommendations-data", //markup intentionally does not contain this id
				properties: mboxArgs
			});
		}
	};

	Cog.register({
		name: "target.dataIntegration",
		api: api,
		requires: [
			{
				name: "target.handler",
				apiId: "targetHandler"
			}
		]
	});
})();
