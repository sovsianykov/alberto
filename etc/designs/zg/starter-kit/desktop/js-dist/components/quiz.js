(function($) {
	"use strict";

	var KEYS = {
		SPACEBAR: 32,
		ENTER: 13
	};

	var PRELOAD = {
		AGRESSIVE: 2, // Load everything, best for small quiz.
		LAZY: 1, // Load one slide at a time, best for large quiz
		DISABLED: 0 // Disable preloading
	};

	var QUIZ_MODES = {
		SINGLE: "single",
		MULTIPLE: "multiple",
		UNDEFINED: "undefined"
	};

	var INTEGRATION_MODES = {
		solarSearch: "solrSearch",
		machineLearning: "machineLearning"
	};

	var LISTING_TYPES = {
		product: "product",
		article: "article"
	};

	var ML_KNTOX_ENDPOINT = "/sk-eu/services/diagnostictool/";

	var options = {
		indicatorDisabled: false,
		scrollDelay: 500, // used if you want to add any animation before scroll starts
		scrollDuration: 500,
		requestMaxLength: 2048,
		separator: ",",
		tagPrefix: "tags:",
		tagJoinMode: "%20OR%20",
		timer: null,
		selectors: {
			step: ".quiz-step",
			currentStep: ".quiz-step.current",
			firstStep: ".quiz-step[data-step='0']",
			inactiveStep: ".quiz-step[aria-hidden='true']:not([data-step='0'])",
			item: ".quiz-target .quizCTA.component",
			next: ".quizCTA-button",
			previous: ".quiz-buttons-previous",
			reset: ".quiz-buttons-reset",
			indicator: ".quiz-indicator",
			container: ".quiz-container",
			target: ".quiz-target", // where the dynamic content will go
			search: ".searchResults.component",
			hidden: ".is-hidden",
			multipleNext: ".quiz-buttons-next",
			quizCTA: ".quizCTA",
			quizPRMQuestionComponent: ".quizPRMQuestion > .component-content",
			quizResultsPage: ".quiz-step.current .quiz-results-page",
			quizComponentContent: " > .component-content",
			containerPRMQuestions: ".quiz-container .quizPRMQuestion",
			contentSnippet: ".contentSnippet .listing",
			dynamicMlProducts: ".listing--dynamicMlProducts",
			dynamicMlArticles: ".listing--dynamicMlArticles",
			mlQuizResultsNoData: ".ml-quiz-no-results",
			dynamicListingItems: ".listing-items",
			productQuickView: ".productQuickView",
			listingContainer: ".listing",
			mlListingFilter: ".quiz-step.current .listingFilters.filter-ml-quiz"
		},
		classNames: {
			active: "is-active",
			current: "current",
			hidden: "is-hidden",
			quizCtaActive: "active",
			quizStart: "quiz-start",
			loader: "loader-animation"
		},
		attributes: {
			answerId: "data-prm-answer-id",
			integration: "data-integration",
			questionType: "data-question-type",
			slidePath: "data-slide-path",
			tags: "data-tags",
			integrationParams: "data-integration-params",
			prmQuestionId: "data-prm-question-id"
		},
		preloadId: "quiz-preload-content",
		quizStepTemplateId: "quiz_step_template",
		preloadContainerHTML: "<div class=\"$id\" style=\"display:none\"></div>",
		isMobile: false,
		sectionQuizType: ""
	};

	var ML_FILTER = {
		selectors: {
			filterForm: ".filter-form",
			filterCategory: ".filter-category",
			filterSubCategory: ".filter-subcategory",
			filterOrder: ".filter-order"
		},
		tags: {
			select: "select"
		},
		attrs: {
			applicationJSON: "script[type='application/json']",
			selectedIndex: "selectedIndex",
			optSelected: "option:selected"
		}
	};

	var analyticsDef;
	var analyticsUtils;
	var prmHandler;
	var prmForm;
	var runmodeUtil;
	//This flag prevents multiple click events being fired due to multiple rapid clicks on the answer container
	var preventMultipleClick = true;

	function Quiz($el) {
		this.$el = $el;
		this.bindEvents();
		this.init();
		this.position = analyticsUtils.getComponentPosition(this.$el);
		this.quizIntegrationMode = this.$el.find(options.selectors.quizComponentContent).attr(options.attributes.integration);
		this.prm = prmHandler.getPrmHandler($el);
		this.integrationParams = this.$el.find(options.selectors.quizComponentContent).attr(options.attributes.integrationParams);
		if (this.integrationParams) {
			this.integrationParams = JSON.parse(this.integrationParams);
		}

	}

	Quiz.prototype = {
		init: function() {
			var observer;
			this.$quizIndiactor = this.$el.find(options.selectors.indicator);
			this.$quizContainer = this.$el.find(options.selectors.container);
			this.startHeight = this.$quizContainer.css("height");
			this.step_template = this.$el.find("." + options.quizStepTemplateId).html();
			this.preLoaded = {};
			this.preLoadedPromises = {};
			this.stage = -1;
			this.options = this.$el.find("[data-options]").data("options");
			this.tags = [];

			options.prevId = this.$el.prev("[id]").attr("id"); // optional, good if it exists
			options = $.extend({}, options, this.options);
			options.preLoadStrategy = parseInt(options.preLoadStrategy || 2, 10);

			this.$quizContainer.css("min-height", this.startHeight);

			this.isMobile();
			this.initIndicator();

			if (options.preLoadStrategy !== PRELOAD.DISABLED) {
				this.$el.append(options.preloadContainerHTML.replace("$id", options.preloadId));
				observer = new MutationObserver(this.contentChanged.bind(this));
				observer.observe(this.$el.find("." + options.preloadId)[0], {
					attributes: false,
					childList: true
				});
				this.preLoad(this.$el.find(options.selectors.currentStep));
			}
		},
		bindEvents: function() {
			var self = this;

			this.$el.on("click keydown", options.selectors.item, function(e) {
				var $currentTarget = $(e.currentTarget);
				var $target = $(e.target);
				if (e.type === "keydown" && !(e.keyCode === KEYS.ENTER || e.keyCode === KEYS.SPACEBAR)) {
					// it's a keypress event and not enter or spacebar so ignore
					return;
				}
				if (options.sectionQuizType === QUIZ_MODES.SINGLE) {

					if ($target.closest(options.selectors.next).length === 0) { // ignore clicks on button
						e.preventDefault();
						if (preventMultipleClick) {
							preventMultipleClick = false;
							self.next({
								target: $currentTarget.find(options.selectors.next)[0]
							});
						}
					}
				} else if (options.sectionQuizType === QUIZ_MODES.MULTIPLE) {
					if ($target.closest(options.selectors.quizCTA).hasClass(options.classNames.quizCtaActive)) {
						$target.closest(options.selectors.quizCTA).removeClass(options.classNames.quizCtaActive);
						var answerId = $target.closest(options.selectors.quizCTA).find("[" + options.attributes.answerId + "]").attr(options.attributes.answerId);
						var removableTag = $target.closest(options.selectors.quizCTA).find("[" + options.attributes.answerId + "]").attr(options.attributes.tags);
						var indexOfTag = this.tags.indexOf(removableTag);
						if (indexOfTag > -1) {
							this.tags.splice(indexOfTag, 1);
						}
						self.prm.removeAnswer(answerId);
					} else {
						$target.closest(options.selectors.quizCTA).addClass(options.classNames.quizCtaActive);
						self.selectMultipleItems({
							target: $currentTarget.find(options.selectors.next)[0]
						});
					}
				}

			}.bind(this));

			this.$el.on("click", options.selectors.next, function(e) {
				e.preventDefault();
				if (preventMultipleClick) {
					preventMultipleClick = false;
					var typeOfSlide = $(e.target).closest(options.selectors.target).find("div[" + options.attributes.questionType + "]").attr(options.attributes.questionType);
					if ($(this).closest(options.selectors.quizCTA).hasClass(options.classNames.quizStart)) {
						self.prm.resetQuestionAnswers();
					}
					if (typeof typeOfSlide === QUIZ_MODES.UNDEFINED || typeOfSlide === QUIZ_MODES.SINGLE) {
						self.next(e);
					}
				}
			});

			this.$el.on("click", options.selectors.multipleNext, function(e) {
				if (preventMultipleClick) {
					preventMultipleClick = false;
					var $target = $(e.target);
					var $section = $target.closest(options.selectors.step);
					var path = $section.find(options.selectors.quizPRMQuestionComponent).attr(options.attributes.slidePath);
					var buttonText = $target.text().trim();
					self.addPanel({path: path, $section: $section});
					self.indicatorNext();
					self.clickCtaAnalytics(buttonText, path);
				}
			});

			this.$el.on("click", options.selectors.previous, function(e) {
				e.preventDefault();
				self.previous(e);
			});

			this.$el.on("click", options.selectors.reset, function(e) {
				e.preventDefault();
				self.reset();
			});
		},
		isMobile: function() {
			// don't do transitions on mobile.
			if ("matchMedia" in window && window.matchMedia("(max-width: " + breakpoints.minTablet + "px)").matches) {
				options.isMobile = true;
				options.scrollDelay = 0;
				options.scrollDuration = 0;
			}
		},
		setViewMobile: function() {
			// easy to get lost on mobile so set the
			// view port to the top of the current quiz
			if (options.isMobile && options.prevId) {
				window.location = "#" + options.prevId;
			}
		},
		selectMultipleItems: function(e) {
			// user triggered action
			// sets the state
			// and gets the next content
			// updates the step indicator
			var $target = $(e.target);
			var $item = $target.closest(options.selectors.item);
			var path = $target.attr("href");
			var tags = $target.data("tags");
			var answerId = $target.attr(options.attributes.answerId);
			var buttonText = $target.text().trim();
			if (tags) {
				this.tags.push(tags);
			}
			this.prm.addAnswer(answerId , options.sectionQuizType);
			$item.addClass(options.classNames.active);
			this.clickCtaAnalytics(buttonText, path);
		},
		next: function(e) {
			// user triggered action
			// sets the state
			// and gets the next content
			// updates the step indicator
			var $target = $(e.target);
			var $section = $target.closest(options.selectors.step);
			var $item = $target.closest(options.selectors.item);
			var path = $target.attr("href");
			var tags = $target.data("tags");
			var answerId = $target.attr(options.attributes.answerId);
			var buttonText = $target.text().trim();

			if (tags) {
				this.tags.push(tags);
			}
			this.prm.addAnswer(answerId, options.sectionQuizType);

			$item.addClass(options.classNames.active);
			$section.addClass(options.classNames.active);

			this.addPanel({path: path, $section: $section});
			this.indicatorNext();
			this.clickCtaAnalytics(buttonText, path);
		},
		previous: function(e) {
			// user triggered action
			// gets the previous content block back
			// updates the step indicator
			var $target = $(e.target);
			var $section = $target.closest(options.selectors.step);
			if (options.sectionQuizType === QUIZ_MODES.MULTIPLE) {
				var $answersCards = $target.closest(options.selectors.currentStep).find(options.selectors.item + "." + options.classNames.quizCtaActive);
				$answersCards.each(function(key, element) {
					var tagsToRemove = $(element).find("[" + options.attributes.tags + "]").attr(options.attributes.tags);
					var matchedIndex = this.tags.indexOf(tagsToRemove);
					if (matchedIndex > -1) {
						this.tags.splice(matchedIndex, 1);
					}
				}.bind(this));
			} else if (options.sectionQuizType === QUIZ_MODES.SINGLE) {
				this.tags.pop();
			}
			this.shift({
				$section: $section,
				reverse: true
			});
			this.indicatorPrevious();
		},
		reset: function() {
			// user triggered action
			// set state
			// and get the FIRST content block back
			// updates the step indicator
			var $firstPanel = $(options.selectors.firstStep);
			this.stage = -1;
			this.tags = [];
			this.prm.setScope($firstPanel, true);

			this.shift({
				$section: $(options.selectors.currentStep),
				reverse: true,
				$prev: $firstPanel
			});
			this.$el.find(options.selectors.inactiveStep).remove();
			this.setIndicator();
		},
		checkPreloadContent: function(path) {
			// if the quiz is preloaded any page containing search results
			// won't have the current tags, so we	 need to reload it.
			// we don't know what pages contain in advance
			// so we have to check the content each time
			var HTML = this.preLoaded[path];
			var parseHTML;

			if (!HTML) {
				// it's not loaded
				return false;
			}

			parseHTML = $.parseHTML(HTML);

			if ($(parseHTML).findSelf(options.selectors.search).length > 0) {
				// it's loaded but contains search results panel so
				// delete it and re-request
				parseHTML = null;
				this.preLoaded[path] = "";
				return false;
			}

			return true;
		},
		addPanel: function(ops) {
			// create next panel and load content
			// load content from memory if it's already been requested
			// otherwise request with $.load()
			// then pass to this.shift to swap content
			var $newPanel = $(this.step_template).appendTo(this.$quizContainer);
			var path = ops.path;
			var self = this;

			this.prm.setScope($newPanel);

			if (this.checkPreloadContent(path)) {
				// check we have the content for this slide, if not then call $.load()
				$newPanel.find(options.selectors.target).html(this.preLoaded[path]);
				var delay = this.stage === -1 ? 0 : options.scrollDelay ;
				setTimeout(function() {
					self.shift({
						$section: ops.$section
					});
					_.defer(function() {
						self.preLoad($newPanel);
					});
				}, delay);
			} else if (path) {
				this.removeUnusedQuestionsIdFromObject();
				$.ajax({
					url: self.getSearchUrl(path),
					method: "GET",
					success: function(data) {

						//creative exchange fix
						if (data.indexOf("<body") !== -1) {
							data = $(data).find(".content")[0].outerHTML;
						}
						self.preLoaded[path] = data;
						$newPanel.find(options.selectors.target).append(data);
						$newPanel.find(options.selectors.hidden).removeClass(options.classNames.hidden);
						self.shift({
							$section: ops.$section
						});
						_.defer(function() {
							self.preLoad($newPanel);
							self.prmForm = prmForm.getPrmForm($newPanel);
							self.prmForm.insertPrmAnswers(self.prm.getAnswers());
							self.quizResultAnalytics($newPanel);
						});
					}
				});
			}
		},
		updateSelectFilterDropdowns: function() {
			var $mlListingFilter = $(options.selectors.mlListingFilter);
			var $form = $mlListingFilter.find(ML_FILTER.selectors.filterForm);
			var $parentSelectWrapper = $form.find(ML_FILTER.selectors.filterCategory);
			var $childSelectWrapper = $form.find(ML_FILTER.selectors.filterSubCategory);
			var $orderSelectWrapper = $form.find(ML_FILTER.selectors.filterOrder);
			var $parentSelect = $parentSelectWrapper.find(ML_FILTER.tags.select);
			var $childSelect = $childSelectWrapper.find(ML_FILTER.tags.select);
			var self = this;
			var data = $mlListingFilter.find(ML_FILTER.attrs.applicationJSON);
			if (data.length) {
				data = JSON.parse(data.text());
			}
			
			updateFilterDropdowns();
			function updateFilterDropdowns() {
				var categoryLabel;
				$orderSelectWrapper.hide();
	
				data.forEach(function(item) {
					if (item.value) {
						$parentSelect.append("<option value=" + item.value + ">" + item.label + "</option>");
					}
				});

				$parentSelect.prop(ML_FILTER.attrs.selectedIndex, 0);
				mlSubCategoryDropdown($parentSelect.val());
	
				$parentSelect.on("change", function() {
					var selectedValue = $parentSelect.val();
					mlSubCategoryDropdown(selectedValue);
					categoryLabel = $parentSelect.find(ML_FILTER.attrs.optSelected).text();
					self.getMachineLearningProducts(categoryLabel);
				});
	
				$childSelect.on("change", function() {
					categoryLabel = $childSelect.find(ML_FILTER.attrs.optSelected).text();
					self.getMachineLearningProducts(categoryLabel);
				});
				categoryLabel = $parentSelect.find(ML_FILTER.attrs.optSelected).text();
				self.getMachineLearningProducts(categoryLabel);
			}
	
			function mlSubCategoryDropdown(selectedValue) {
				$childSelect.html("");
				if (selectedValue) {
					var childCategoryData = data.filter(function(item) {
						return item.value === selectedValue;
					});
					childCategoryData.forEach(function(item) {
						item.tags.forEach(function(tags) {
							if (tags.value) {
								$childSelect.append("<option value=" + tags.value + ">" + tags.label + "</option>");
							}
						});
					});
				} else {
					$childSelect.append("<option>No sub Category</option>");
				}
			}
		},
		checkForQuizResultsPage: function() {
			if (($(options.selectors.quizResultsPage).length > 0) && (this.quizIntegrationMode === INTEGRATION_MODES.machineLearning)) {
				this.updateSelectFilterDropdowns();
				this.getMachineLearningArticles();
			}
		},
		getMachineLearningProducts: function(categoryLabel) {
			var productQuizData = this.quizDataToSubmit();
			productQuizData.category = categoryLabel;
			var cacheKey = categoryLabel + this.getCacheKey();
			productQuizData.cachekey = "cachekey=" + cacheKey;
			productQuizData.restUrl = this.integrationParams.productEndpoint;
			productQuizData.privateKey = this.integrationParams.productPrivateKey;
			var productRequestJSON = new FormData();
			productRequestJSON.append("param", JSON.stringify(productQuizData));
			this.getMLNumbersForQuizData(LISTING_TYPES.product, productRequestJSON);
		},
		getMachineLearningArticles: function() {
			var articleQuizData = this.quizDataToSubmit();
			articleQuizData.cachekey = "cachekey=" + this.getCacheKey();
			articleQuizData.restUrl = this.integrationParams.articleEndpoint;
			articleQuizData.privateKey = this.integrationParams.articlePrivateKey;
			var articleRequestJSON = new FormData();
			articleRequestJSON.append("param", JSON.stringify(articleQuizData));
			this.getMLNumbersForQuizData(LISTING_TYPES.article, articleRequestJSON);
		},
		getMLNumbersForQuizData: function(listingType, requestBody) {
			var self = this;
			var selectorForLoader = self.getActiveSection(listingType);
			self.addAnimationLoader(selectorForLoader);
			$.ajax({
				url: ML_KNTOX_ENDPOINT + listingType,
				type: "POST",
				processData: false,
				mimeType: "multipart/form-data",
				contentType: false,
				data: requestBody,
				success: function(responseData) {
					var response = JSON.parse(responseData);
					if (response.statusCode === 200) {
						var eanNumbers = response.body;
						if (listingType === LISTING_TYPES.article) {
							eanNumbers = eanNumbers.replace(/[\[,\]]/g, "").split(" ");
						} else {
							eanNumbers = JSON.parse(eanNumbers);
						}
						self.getUrlForContent(eanNumbers, listingType, false);
					} else {
						self.getUrlForContent([], listingType, true);
					}
				},
				error: function() {
					console.log("Could not fetch reponse");
					self.removeAnimationLoader(selectorForLoader);
				}
			});
		},
		addAnimationLoader: function(selector) {
			$(selector).find("." + options.classNames.loader).remove();
			$(selector).find(options.selectors.dynamicListingItems).html("");
			$(selector).find(options.selectors.quizComponentContent).append("<div class='" + options.classNames.loader + "'></div>");
		},
		removeAnimationLoader: function(selector) {
			$(selector).find("." + options.classNames.loader).remove();
		},
		getActiveSection: function(listingType) {
			return listingType === LISTING_TYPES.product ? options.selectors.dynamicMlProducts : options.selectors.dynamicMlArticles;
		},
		getProductsFullContent: function(snippetPath, listingType, showNoResultsFound) {
			var self = this;
			var selectorForLoader = self.getActiveSection(listingType);
			$.ajax({
				url: snippetPath,
				type: "GET",
				success: function(response) {
					var result = $(response).find(options.selectors.contentSnippet).html();
					var errorMessageContent = $(response).find(options.selectors.mlQuizResultsNoData);
					self.replaceListingContent(result, errorMessageContent, listingType, showNoResultsFound);
				},
				error: function() {
					console.log("Could not fetch reponse");
					$(selectorForLoader).find(options.selectors.dynamicListingItems).append("<p class='ml-quiz-no-results'>There are some error while getting recommendation, please try again after sometime</p>");
					self.removeAnimationLoader(selectorForLoader);
				}
			});
		},
		replaceListingContent: function(result, errorMessageContent, listingType, showNoResultsFound) {
			var selector = this.getActiveSection(listingType);
			if (showNoResultsFound) {
				$(selector).find(options.selectors.dynamicListingItems).html(errorMessageContent);
				this.removeAnimationLoader(selector);
			} else {
				$(selector).html(result);
				Cog.init({
					$element: $(options.selectors.productQuickView)
				});
				Cog.init({
					$element: $(options.selectors.listingContainer)
				});
				this.removeAnimationLoader(selector);
			}
		},
		getUrlForContent: function(eanNumbers, listingType, showNoResultsFound) {
			var snippetPath = listingType === LISTING_TYPES.product ? this.integrationParams.productSnippetPath : this.integrationParams.articleSnippetPath;
			if (eanNumbers.length > 0) {
				snippetPath += "." + eanNumbers.join(".");
			}
			snippetPath += ".html";
			if (runmodeUtil.isAuthor()) {
				snippetPath += "?wcmmode=disabled";
			}
			this.getProductsFullContent(snippetPath, listingType, showNoResultsFound);
		},
		getCacheKey: function() {
			var answers = this.prm.getAnswers();
			var cacheKey = "";
			for (var questionId in answers) {
				if (answers.hasOwnProperty(questionId)) {
					var questionDetails;
					if (Array.isArray(answers[questionId])) {
						questionDetails = answers[questionId];
					} else {
						questionDetails = answers[questionId].split();
					}
					cacheKey += "|" + questionId + ":[" + questionDetails + "]";
				}
			}
			return encodeURIComponent(cacheKey);
		},
		removeUnusedQuestionsIdFromObject: function() {
			var getAnswers = this.prm.getAnswers();
			var questionids = [];
			this.$el.find(options.selectors.containerPRMQuestions).each(function() {
				questionids.push($(this).find(options.selectors.quizComponentContent).attr(options.attributes.prmQuestionId));
			});
			for (var questionId in getAnswers) {
				if (getAnswers.hasOwnProperty(questionId)) {
					if (questionids.indexOf(questionId) === -1) {
						delete getAnswers[questionId];
					}
				}
			}
			this.prm.updateQuestionAnswers(getAnswers);
		},
		quizDataToSubmit: function() {
			var QAObject = {
				"questionResponse": [],
				"locale": this.integrationParams.locale,
				"brand": this.integrationParams.brand,
				"records": 1000
			};
			var selectedQAObj = this.prm.getAnswers();
			for (var questionId in selectedQAObj) {
				if (selectedQAObj.hasOwnProperty(questionId)) {
					var obj = {
						"id": questionId,
						"answers": []
					};
					var isMultiTypeQuiz = Array.isArray(selectedQAObj[questionId]);
					if (isMultiTypeQuiz) {
						for (var i = 0; i < selectedQAObj[questionId].length; i++) {
							obj.answers.push({
								"answerId": selectedQAObj[questionId][i]
							});
						}
					} else {
						obj.answers.push({
							"answerId": selectedQAObj[questionId]
						});
					}
					QAObject.questionResponse.push(obj);
				}
			}
			return QAObject;
		},
		quizResultAnalytics: function($markup) {
			var productEans = [];
			$markup.find("[data-ean]").each(function(counter, element) {
				productEans.push($(element).attr("data-ean"));
			});
			Cog.fireEvent("quizResult", analyticsDef.CLICK.QUIZ_RESULT, {
				componentPosition: this.position,
				productEans: productEans,
				slideNumber: this.stage
			});
		},
		clickCtaAnalytics: function(buttonText, nextSlideUrl) {
			var isStartPage = this.stage === 0;

			Cog.fireEvent("quizCta", analyticsDef.CLICK.QUIZ_CTA, {
				componentPosition: this.position,
				nextSlideUrl: nextSlideUrl,
				answer: buttonText,
				slideNumber: this.stage,
				isStartPage: isStartPage
			});
		},
		shift: function(ops) {
			// this method moves the content blocks
			// default direction is to the left
			// move to the right set reverse = true;
			// to implement a different
			// transition e.g. crossfade etc.. change this method
			var $section = ops.$section;
			var $prev = ops.$prev;
			var w = this.$quizContainer.width() * 1.1;
			var $next = $section.next();
			var _out1 = w ;
			var _out2 = w * -1;
			var self = this;

			if (ops.reverse) {
				if ($prev) {
					$next = $prev;
				} else {
					$next = $section.prev();
				}
				_out1 = w * -1;
				_out2 = w;
			}

			if ($next.height() > this.$quizContainer.height()) {
				this.$quizContainer.height($next.height());
			}

			$section.removeClass(options.classNames.current).css("left", 0 + "px").animate({
				left: _out2 + "px"
			}, options.scrollDuration, function() {
				$section.attr("aria-hidden", "true").removeClass(options.classNames.active);
				$section.find("." + options.classNames.active).removeClass(options.classNames.active);
				if (ops.reverse) {
					$section.remove();
				}
				preventMultipleClick = true;
			});
			$next.css("left", _out1 + "px").attr("aria-hidden", "false").animate({
				left: 0 + "px"
			}, options.scrollDuration, function() {
				$next.addClass(options.classNames.current);
				var $newPanel = $next.find(options.selectors.target);
				self.prm.setScope($newPanel);
				Cog.init({$element: $newPanel});
				// the actual CTAs might not be visible so
				// add tabindex to containing block
				$next.find(options.selectors.item)
					.attr("tabindex", "0")
					.attr("role", "button");
				self.$quizContainer.height(""); // remove height declaration
				self.$quizContainer.css("min-height", $next.height() + "px");
				self.setViewMobile();
				options.sectionQuizType = $newPanel.find("" + options.selectors.quizPRMQuestionComponent + "[" + options.attributes.questionType + "]").attr(options.attributes.questionType);
				if (options.sectionQuizType === QUIZ_MODES.SINGLE || options.sectionQuizType === QUIZ_MODES.UNDEFINED || $(".quiz-step.current .searchResults").length > 0) {
					self.prm.removeMultipleNextButton();
				} else if ($newPanel.find(options.selectors.quizCTA + "." + options.classNames.quizCtaActive).length > 0) {
					self.prm.showMultipleNextButton();
				} else {
					self.prm.hideMultipleNextButton();
				}
				if (options.sectionQuizType === QUIZ_MODES.SINGLE && ops.reverse) {
					self.tags.pop();
				}
				self.checkForQuizResultsPage();
			});
		},
		initIndicator: function() {
			if (options.indicatorDisabled || this.$quizIndiactor.find("li").length === 0) {
				this.$quizIndiactor.remove();
				return;
			}

			this.setIndicator();
		},
		indicatorNext: function() {
			this.stage = this.stage + 1;
			this.setIndicator();
		},
		indicatorPrevious: function() {
			this.stage = this.stage - 1;
			this.setIndicator();
		},
		setIndicator: function() {
			if (this.indicatorDisabled) {
				return;
			}
			var isVisable = this.stage === -1 ? "true" : "false";

			this.$quizIndiactor
				.attr("aria-hidden", isVisable)
				.find("[aria-current]")
				.removeAttr("aria-current");
			if (this.stage > -1) {
				this.$quizIndiactor
					.find("[data-step=\"" + this.stage + "\"]")
					.attr("aria-current","step");
			}
		},
		contentChanged: function() {
			if (options.preLoadStrategy === PRELOAD.AGRESSIVE) {
				this.preLoad();
			}
		},
		preLoad: function($el) {
			// given an html block find all the links
			// and fetch them (if they aren't in cache
			if (options.preLoadStrategy === PRELOAD.DISABLED) {
				return;
			}
			$el = $el || this.$el.find("." + options.preloadId);
			var $links = $el.find(options.selectors.next + ":not(.prefetch)");
			var when = $.when({});
			var self = this;

			$links.each(function(index, link) {
				var $link = $(link);
				var url = $link.attr("href");

				if (!self.preLoadedPromises.hasOwnProperty(url)) {
					$link.addClass("prefetch");
					var resultPromise = self.getDeferred(url);
					self.preLoadedPromises[url] = resultPromise;
					when = when.then(resultPromise);
				}
			});
		},
		getDeferred: function(url) {
			var self = this;
			return function() {
				// wrap with a deferred
				var defer = $.Deferred();

				$.ajax({
					url: self.getUrl(url),
					method: "GET",
					success: function(data) {
						//creative exchange fix
						if (data.indexOf("<body") !== -1) {
							data = $(data).find(".content")[0].outerHTML;
						}
						self.$el.find("." + options.preloadId).append(data);
						self.preLoaded[url] = data;
					},
					error: function(data) {
						data = data || {status: "unknown"};
						self.preLoaded[url] = data.statusText || data.status;
					},
					complete: function() {
						// resolve when complete always.
						// Even on failure we want to keep going with other requests
						defer.resolve();
					}
				});
				// return a promise so that we can chain properly in the each
				return defer.promise();
			};
		},
		getSearchUrl: function(url) {
			var filters = this.encodeTags(this.tags);
			var originLength = location.origin.length; // get length of domain name
			var prefix = url.includes("?") ? "&" : "?";
			var qs = prefix + "q=";
			var cqPath = this.getUrl(url);
			var hrefLength = originLength + cqPath.length + qs.length;
			var filtersMaxLength = options.requestMaxLength - hrefLength;

			// check request is not too long, if so
			// drop tags from the begging until it's ok
			while (filters.length > filtersMaxLength) {
				this.tags.shift();
				filters = this.encodeTags(this.tags);
			}

			cqPath = cqPath + qs + filters;
			return cqPath;
		},
		getUrl: function(url) {
			url = url.replace(".html","/_jcr_content/content.html");
			return url;
		},
		encodeTags: function(tags) {
			var encodedTags = [];
			$.each(tags, function(index, tag) {
				if (tag) {
					var escapedColons = tag.split(":").join("\\:");
					escapedColons = this.parseMultipleTags(escapedColons);
					encodedTags.push(options.tagPrefix + "(*" + escapedColons + "*)");
				}
			}.bind(this));
			return encodedTags.join(options.tagJoinMode);
		},
		parseMultipleTags: function(multipleTag) {
			var multipleTagsJoin = "*)" + options.tagJoinMode + options.tagPrefix + "(*";
			return multipleTag.split(",").join(multipleTagsJoin);
		}
	};

	var breakpoints;
	var api = {
		onRegister: function(scope) {
			breakpoints = this.external.breakpoints;
			analyticsDef = this.external.eventsDefinition;
			analyticsUtils = this.external.utils;
			prmHandler = this.external.prmHandler;
			prmForm = this.external.prmForm;
			runmodeUtil = this.external.runmodeUtil;
			new Quiz(scope.$scope);
		}
	};

	Cog.registerComponent({
		name: "product.selector.quiz",
		api: api,
		selector: ".quiz.component",
		requires: [{
			name: "product.selector.quiz.prmAnswersRegistry",
			apiId: "prmHandler"
		},
		{
			name: "product.selector.quiz.prmForm",
			apiId: "prmForm"
		},
		{
			name: "utils.breakpoints",
			apiId: "breakpoints"
		},
		{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
		{
			name: "analytics.utils",
			apiId: "utils"
		},
		{
			name: "utils.status",
			apiId: "runmodeUtil"
		}]
	});

})(Cog.jQuery());
