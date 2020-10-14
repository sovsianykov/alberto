(function($) {
	"use strict";

	function PrmForm($scope) {
		this.$scope = $scope;
		this.init();

	}

	PrmForm.prototype = {
		init: function() {
			this.$form = this.$scope.find("form");
		},

		insertPrmAnswers: function(answers) {
			if (this.$form.length) {
				this.$form.find("input [data-prm-dynamic]").remove();
				$.each(answers, function(questionId, answerId) {
					if (typeof answers[questionId] === "string") {
						var input = api.createFormInput(questionId, answerId);
						this.$form.prepend(input);
					} else {
						for (var i = 0; i < answers[questionId].length; i++) {
							var inputElem = api.createFormInput(questionId, answerId[i]);
							this.$form.prepend(inputElem);
						}
					}
				}.bind(this));
			}
		}
	};

	var sharedApi = {
		getPrmForm: function($scope) {
			return new PrmForm($scope);
		}
	};

	var api = {
		createFormInput: function(questionId, answerId) {
			return $("<input>", {
				"data-prm-dynamic": "true",
				"type": "hidden",
				"name": "question_" + questionId + "_answer_" + answerId,
				"value": true
			});
		}
	};

	Cog.register({
		name: "product.selector.quiz.prmForm",
		api: api,
		sharedApi: sharedApi,
		selector: ".quiz.component"
	});

})(Cog.jQuery());
