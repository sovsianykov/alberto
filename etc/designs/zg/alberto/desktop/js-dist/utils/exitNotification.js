(function($) {
	"use strict";

	var api = {},
		href,
		blank,
		hiddenClass = "is-hidden";

	function openDialog(event) {
		var $target = $(event.target);

		event.preventDefault();

		if ($target.prop("tagName").toUpperCase() !== "A") {
			$target = $target.closest(".external");
		}

		href = $target.attr("href");
		blank = $target.attr("target");

		api.scope.removeClass(hiddenClass);
		return false;
	}

	function acceptButton() {
		if (blank === "_blank") {
			window.open(href, "_blank");
			api.scope.addClass(hiddenClass);
		} else {
			window.location.href = href;
		}
	}

	function denyButton() {
		api.scope.addClass(hiddenClass);
	}

	api.init = function(scope) {
		api.scope = scope;
		api.scope.find(".exit-notification-accept").click(acceptButton);
		api.scope.find(".exit-notification-deny").click(denyButton);
		$("body").on("click", "a.external", openDialog);
	};

	Cog.register({
		name: "exitNotification",
		api: api,
		selector: "#exit-notification"
	});
})(Cog.jQuery());