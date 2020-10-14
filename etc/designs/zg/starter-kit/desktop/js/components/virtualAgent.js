(function($) {
	"use strict";

	var analyticsDef;
	var analyticsUtils;
	var api = {};
	var ENTER_KEY_CODE = 13;

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;

		new VirtualAgent(scope.$scope);
	};

	function VirtualAgent($el) {
		this.$el = $el;
		this.tpl = doT.template($el.find("[type='text/x-dot-template']").text());
		this.$input = $el.find(".virtualAgent-input");
		this.$reset = $el.find(".virtualAgent-reset");
		this.$question = $el.find(".virtualAgent-question");
		this.$answer = $el.find(".virtualAgent-answer");
		this.$results = $el.find(".virtualAgent-results");
		this.$noresults = $el.find(".virtualAgent-noresults");
		this.$footer = $el.find(".virtualAgent-footer");
		this.$footerLink = this.$footer.find("a");
		this.$relatedQuestions = $el.find(".virtualAgent-related-questions");
		this.config = $el.find(".configuration").data();
		this.componentPosition = analyticsUtils.getComponentPosition($el);

		this.bindUIEvents();

		if (this.config && this.config.searchUrl) {
			this.attachTypeahead(this.$input, this.configureEntries(this.config.searchUrl));
		}
	}

	VirtualAgent.prototype = {
		bindUIEvents: function() {
			this.$input.on("typeahead:select", function(evt, suggestion) {
				if (!suggestion) {
					return false;
				}

				this.renderDescription(suggestion);
				this.eventAnalytic(suggestion.question, this.componentPosition);
			}.bind(this));

			this.$input.on("typeahead:render", function(evt, suggestions) {
				this.$results.removeClass("is-loading");
				var suggestionsCount;

				if (suggestions && suggestions.isEmpty) {
					this.$noresults.show();
					this.$results.hide();
					this.$footer.show();
					suggestionsCount = 0;
				} else {
					this.$results.show();
					this.$noresults.hide();
					suggestionsCount = $(".virtualAgent").find(".tt-suggestion").length || 0;
				}

				if (suggestions) {
					this.eventAnalytic(suggestionsCount + " - " + evt.currentTarget.value, this.componentPosition);
				}
			}.bind(this));

			this.$input.on("typeahead:asyncrequest", function() {
				this.$results.addClass("is-loading");
				this.$results.children().hide();
				this.$footer.hide();
			}.bind(this));

			this.$input.on("typeahead:asyncreceive", function() {
				this.$results.removeClass("is-loading");
			}.bind(this));

			this.$input.on("typeahead:asynccancel", function() {
				this.$noresults.show();
				this.$footer.show();
			}.bind(this));

			this.$input.on("keypress", function(e) {
				var code = e.which;

				if (code === ENTER_KEY_CODE) {
					e.preventDefault();
					return false;
				}
			});

			this.$input.on("input", function() {
				var value = this.$input.val();

				if (value.length > 0) {
					this.$reset.show();
				} else {
					this.$reset.hide();
				}
			}.bind(this));

			this.$reset.on("click", function() {
				this.$input.typeahead("val", "");
				this.$reset.hide();
				this.$noresults.hide();
				this.$footer.hide();
				this.$results.removeClass("is-loading").children().hide();
			}.bind(this));

			this.$el.on("click", ".virtualAgent-related-question", function(ev) {
				var entry = $(ev.target).data();

				this.renderDescription({
					knowledgeBaseId: entry.entryId,
					question: entry.entryQuestion,
					answer: entry.entryAnswer
				});

				ev.preventDefault();
				this.eventAnalytic(entry.entryQuestion, this.componentPosition);
			}.bind(this));

			analyticsUtils.trackLinks(this.$footerLink, {
				isCta: true,
				componentName: "Virtual Agent",
				componentPosition: this.componentPosition,
				category: analyticsDef.ctConstants.engagement,
				subcategory: analyticsDef.ctConstants.interest
			});

			this.onloadAnalytics(this.position);
		},

		configureEntries: function(searchUrl) {
			return new Bloodhound({
				datumTokenizer: Bloodhound.tokenizers.obj.whitespace("value"),
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				remote: {
					url: searchUrl + "?searchTerm=&QUERY&",
					wildcard: "&QUERY&",
					transform: function(response) {
						if (response.length === 0) {
							response = [{"isEmpty": true}];
						}
						return response;
					}
				}
			});
		},

		attachTypeahead: function($input, entries) {
			$input.typeahead({
				minLength: 3,
				highlight: true
			}, {
				source: entries,
				limit: 10,
				display: "question"
			});
		},

		renderDescription: function(suggestion) {
			this.$results.addClass("is-loading");
			this.$input.typeahead("val", suggestion.question);

			$.get(this.config.relatedUrl + "?id=" + suggestion.knowledgeBaseId + "&searchTerm=" + suggestion.question, function(data) {
				var relatedEntries = JSON.parse(data);
				this.$question.text(suggestion.question);
				this.$answer.text(suggestion.answer);
				this.$relatedQuestions.html(this.tpl(relatedEntries));
				this.$results.removeClass("is-loading");
				this.$results.children().fadeIn(500);
				this.$footer.show();
			}.bind(this));
		},

		eventAnalytic: function(label, position) {
			Cog.fireEvent("virtualAgent", analyticsDef.CLICK.VIRTUAL_AGENT_CLICK, {
				label: label,
				componentPosition: position
			});
		},

		onloadAnalytics: function(position) {
			Cog.fireEvent("virtualAgent", analyticsDef.LOAD.VIRTUAL_AGENT, {
				componentPosition: position
			});
		}
	};

	Cog.registerComponent({
		name: "virtualAgent",
		api: api,
		selector: ".virtualAgent",
		requires: [{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
		{
			name: "analytics.utils",
			apiId: "utils"
		}]
	});

})(Cog.jQuery());
