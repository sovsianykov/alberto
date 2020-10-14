/**
 * Rich Text
 */
(function($) {
	"use strict";

	var api = {};
	var url;

	function RichTextWithQSData($el) {
		this.$el = $el;
		this.$qsDataEls = this.$el.find(".data-querystring");
		this.qsData = url.getQueryParams();

		if (this.$qsDataEls.length && !$.isEmptyObject(this.qsData)) {
			this.processQSElements();
		}
	}

	RichTextWithQSData.prototype.processQSElements = function() {
		// usage example
		// querystring: ?bregion=US&bstate=AR&bzip=10010&
		// HTML:
		// 		<span class="data-querystring">bzip</span>
		// OUTPUT:
		// 		<span class="data-querystring processed">10010</span>
		// HTML:
		// 		<span class="data-querystring"><span class="alert">bzip</span></span>
		// OUTPUT:
		// 		<span class="data-querystring processed"><span class="alert">10010</span></span>
		var self = this;
		this.$qsDataEls.each(function(i, el) {
			var text = $(el).text();
			if (self.qsData[text]) { // element exists is QS map
				if ($(el).find(":contains('" + text + "')").length) {
					// nested element
					$(el)
						.addClass("processed")
						.find(":contains('" + text + "')")
						.text(self.qsData[text]);
				} else {
					// normal element
					$(el)
						.text(self.qsData[text])
						.addClass("processed");
				}
			}
		});
	};

	api.onRegister = function(scope) {
		url = this.external.url;
		new RichTextWithQSData(scope.$scope);
	};

	Cog.registerComponent({
		name: "richTextWithQSData",
		api: api,
		selector: ".richText-with-querystring-data",
		requires: [{
			name: "utils.url",
			apiId: "url"
		}]
	});
})(Cog.jQuery());
