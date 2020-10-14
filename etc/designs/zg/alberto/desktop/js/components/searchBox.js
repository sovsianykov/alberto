/**
 * Search Box
 * Preventing empty queries from being sent to the search engine
 */
(function() {
	"use strict";

	var api = {};

	function SearchBox($element) {
		this.$button = $element.find(".button");
		this.$input = $element.find(".search-query");
		this.bindUIEvents();
	}

	SearchBox.prototype = {
		bindUIEvents: function() {
			this.$button.on("click", this.onButtonClick.bind(this));
		},

		onButtonClick: function(event) {
			if (this.$input.val().trim() === "") {
				event.preventDefault();
			}
		}
	};

	api.onRegister = function(element) {
		new SearchBox(element.$scope);
	};

	Cog.registerComponent({
		name: "searchBox",
		api: api,
		selector: ".searchBox"
	});

})();
