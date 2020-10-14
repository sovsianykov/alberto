/*
 * CookieQ blocks some integrations by default when enabled.
 * We have to refresh the page in order to load them after user accepts cookie policy.
 */
(function() {
	"use strict";

	var api = {};
	var sharedApi = {};
	var cookieqStatus = {
		ALL: "all", // means consent has been given but panel still shown
		ALL_ACCEPTED: "all_accepted", // means consent has been given but panel not shown
		NONE: "none", // means user is opted-out
		REFUSED: "refused", // means user is opted-out but no panel is shown
		SOME: "some" // user has agreed to some third-parties (not used on Unilever sites as yet)
	};
	var previousStatus = "";
	var currentStatus = "";

	api.init = function() {
		document.addEventListener("consent", function(event) {
			previousStatus = currentStatus;
			currentStatus = event.detail.status;

			if ((previousStatus === cookieqStatus.NONE || previousStatus === cookieqStatus.REFUSED) &&
				currentStatus === cookieqStatus.ALL_ACCEPTED) {
				window.location.reload();
			}

			Cog.fireEvent("utils.cookieq", "statusChanged");
		});
	};

	sharedApi.getStatus = function() {
		return {
			previous: previousStatus,
			current: currentStatus
		};
	};

	sharedApi.getAvailableStatuses = function() {
		return cookieqStatus;
	};

	Cog.registerStatic({
		name: "utils.cookieq",
		api: api,
		sharedApi: sharedApi
	});
}());
