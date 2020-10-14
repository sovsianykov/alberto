(function($) {
	"use strict";

	var CLASSES = {
		PRM_QUESTION: "div.quizPRMQuestion > [data-prm-question-id]",
		CURRENT_NEXT_BUTTON: ".quiz-step.current .quiz-buttons .quiz-buttons-next"
	};

	var QUIZ_MODES = {
		SINGLE: "single",
		MULTIPLE: "multiple",
		UNDEFINED: "undefined"
	};

	var ATTRIBUTES = {
		PRM_QUESTION_ID: "data-prm-question-id"
	};

	function Prm($scope) {
		this.$scope = $scope;
		this.answers = {};
	}

	Prm.prototype = {
		addAnswer: function(answerId, quizType) {
			var questionId = this.getCurrentQuestionId();
			if (quizType === QUIZ_MODES.MULTIPLE) {
				if (typeof this.answers[questionId] === QUIZ_MODES.UNDEFINED) {
					this.answers[questionId] = [];
					this.answers[questionId].push(answerId);
				} else if (this.answers[questionId].indexOf(answerId) === -1) {
					this.answers[questionId].push(answerId);
				}
				if (this.answers[questionId].length > 0) {
					this.showMultipleNextButton();
				} else {
					this.hideMultipleNextButton();
				}
			} else if (quizType === QUIZ_MODES.SINGLE) {
				this.answers[questionId] = answerId;
			}
		},
		getQuestionAndAnswers: function() {
			return this.answers;
		},
		removeAnswer: function(answerId) {
			var questionId = this.getCurrentQuestionId();
			var index = this.answers[questionId].indexOf(answerId);
			if (index !== -1) {
				this.answers[questionId].splice(index, 1);
				if (this.answers[questionId].length === 0) {
					this.hideMultipleNextButton();
				}
			}
		},
		hideMultipleNextButton: function() {
			$(CLASSES.CURRENT_NEXT_BUTTON).hide();
		},
		showMultipleNextButton: function() {
			$(CLASSES.CURRENT_NEXT_BUTTON).show();
		},
		removeMultipleNextButton: function() {
			$(CLASSES.CURRENT_NEXT_BUTTON).remove();
		},
		getCurrentQuestionId: function() {
			return this.$scope
				.find(CLASSES.PRM_QUESTION)
				.attr(ATTRIBUTES.PRM_QUESTION_ID);
		},
		setScope: function($scope, resetAnswers) {
			if (resetAnswers) {
				this.answers = {};
			}
			this.$scope = $scope;
		},
		getAnswers: function() {
			return this.answers;
		},
		resetQuestionAnswers: function() {
			this.answers = {};
		},
		updateQuestionAnswers: function(questionAnswers) {
			this.answers = questionAnswers;
		}
	};

	var sharedApi = {
		getPrmHandler: function($scope) {
			return new Prm($scope);
		}
	};

	var api = {};

	Cog.register({
		name: "product.selector.quiz.prmAnswersRegistry",
		api: api,
		sharedApi: sharedApi,
		selector: ".quiz.component"
	});

})(Cog.jQuery());
