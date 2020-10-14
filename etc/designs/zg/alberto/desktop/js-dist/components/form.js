/**
 * Form
 */

(function($) {
	"use strict";

	var api = {};
	var clearForm;
	var resetForm;
	var manualInputs;
	var analyticsDef;
	var analyticsUtils;
	var formUtils;
	var autoFillForm;
	var ctConstants;
	var urlUtils;

	var SELECTORS = {
		formType: "#formType",
		entity: "#entity",
		input: "input",
		enableUTMParams: "enable-utm-params",
		checkboxInputs: ".reference-checkbox-item input",
		radioInputs: ".radioGroup input",
		select: "select",
		radioGroup: ".radioGroup",
		checkboxGroup: ".reference-checkbox-item",
		selectField: ".selectField",
		controlLabel: ".control-label",
		selectedOption: "option:selected",
		radio: "radio",
		optincorporate: "input[name='optincorporate']",
		fileInput: "input[type='file']",
		promotigoformId: "#promotigoformId",
		entryFormId: "#EntryId",
		fileUploadWrap: ".fileUpload",
		form: "form"
	};

	var UNDEFINED = "undefined";

	var ATTRIBUTES = {
		name: "name",
		type: "type",
		checked: ":checked"
	};

	function Form($el) {
		this.$el = $el;
		this.$inputElements = this.$el.find(SELECTORS.input);
		this.$checkboxInputFields = this.$el.find(SELECTORS.checkboxInputs);
		this.$radioInputFields = this.$el.find(SELECTORS.radioInputs);
		this.$selectDropdowns = this.$el.find(SELECTORS.select);

		this.componentPosition = analyticsUtils.getComponentPosition(this.$el);
		this.questionsObject = {};
		this.questionsAndAnswersString = "";
		this.isThisPromotigoForm = this.$el.find(SELECTORS.entity).val() === "promotigo";
		this.fileInput = this.$el.find(SELECTORS.fileInput);
		this.allowedMaximumFileSize = 5;
		this.$promotigoFormIdElement = this.$el.find(SELECTORS.promotigoformId);
		this.promotigoformId = this.$promotigoFormIdElement.val();
		this.formTypeName = this.$el.find(SELECTORS.formType).val();

		this.addUTMParamsHiddenFieldToForm();
		this.bindUIEvents();
	}

	Form.prototype = {
		bindUIEvents: function() {
			this.$checkboxInputFields.on("change", function(event) {
				this.getPromotigoQuesionAndAnswerFieldsData(this.$checkboxInputFields);
				var attributeName = event.target.getAttribute(ATTRIBUTES.name);
				if (this.isItQuestionAndAnswerElement(attributeName)) {
					this.fireSurveyEditAnalytics();
				}
			}.bind(this));

			this.$radioInputFields.on("change", function(event) {
				this.getPromotigoQuesionAndAnswerFieldsData(this.$radioInputFields);
				var attributeName = event.target.getAttribute(ATTRIBUTES.name);
				if (this.isItQuestionAndAnswerElement(attributeName)) {
					this.fireSurveyEditAnalytics();
				}
			}.bind(this));

			this.$selectDropdowns.on("change", function(event) {
				this.updatePromotigoQuestionAndAnswerObjectOnChangeOfDropdown();
				var attributeName = event.target.getAttribute(ATTRIBUTES.name);
				if (this.isItQuestionAndAnswerElement(attributeName)) {
					this.fireSurveyEditAnalytics();
				}
			}.bind(this));

			this.fileInput.on("change", function(event) {
				if (event.target.files.length > 0) {
					var promotigoFileUploadGatewayAddress = "/sk-eu/services/promotigofileupload";
					var selectedFile = event.target.files[0];
					var fileSizeInMb = selectedFile.size / 1048576; // converts Bytes to MB
					$(event.target).attr("sizelimit", 5); // this is for validation js
					switch (this.formTypeName) {
						case "SIGN_UP":
							break;
						case "CONTACT_US":
							break;
						case "promotigo":
							if (fileSizeInMb <= 5) {
								this.convertImageFileTobase64(event.target.files, function(base64) {
									var formData = new FormData();
									var promotigoFormIdElementChange = this.$promotigoFormIdElement;
									formData.append("File", base64);
									formData.append("FormId", this.promotigoformId);
									$.ajax({
										type: "POST",
										url: promotigoFileUploadGatewayAddress,
										data: formData,
										cache: false,
										contentType: false,
										processData: false,
										success: function(res) {
											var entry = JSON.parse(res);
											promotigoFormIdElementChange.val(entry.Entry.NextFormId);
											if (this.$el.find(SELECTORS.entryFormId).length === 0) {
												$("<input>", {
													type: "hidden",
													id: "EntryId",
													name: "EntryId",
													value: entry.Entry.EntryId
												}).appendTo(this.$el.find("form"));
											} else {
												this.$el.find(SELECTORS.entryFormId).val(entry.Entry.EntryId);
											}
										}.bind(this),
										error: function() {
											console.log("Promotigo file upload call failed. Please upload the image again");
										}
									});
								}.bind(this));
							}
							break;
					}
				}
			}.bind(this));

			this.getPromotigoQuesionAndAnswerFieldsData(this.$checkboxInputFields);
			this.getPromotigoQuesionAndAnswerFieldsData(this.$radioInputFields);
			this.updatePromotigoQuestionAndAnswerObjectOnChangeOfDropdown();
		},
		addUTMParamsHiddenFieldToForm: function() {
			var url = window.location.href;
			var params = urlUtils.getQueryParams(url, true);
			if (this.$el.hasClass(SELECTORS.enableUTMParams) && params.utm_source && params.utm_campaign) {
				var utmInputValue = encodeURIComponent("utm_source=" + params.utm_source + "&utm_campaign=" + params.utm_campaign);
				this.$el.find(SELECTORS.form).append("<input type='hidden' value='" + utmInputValue + "' name='utmParameters'/>");
			}
		},
		convertImageFileTobase64: function(files, callback) {
			var filesSelected = files;
			if (filesSelected.length > 0) {
				var fileToLoad = filesSelected[0];
				var fileReader = new FileReader();
				fileReader.onload = function(fileLoadedEvent) {
					callback(fileLoadedEvent.target.result);
				};
				fileReader.readAsDataURL(fileToLoad);
			}
		},
		isItQuestionAndAnswerElement: function(attributeName) {
			var inputNamePattern = new RegExp("^[aA][1-9][0-9]*$");
			return inputNamePattern.test(attributeName);
		},
		getPromotigoQuesionAndAnswerFieldsData: function($items) {
			if (this.isThisPromotigoForm) {
				$items.each(function(index, $el) {
					var $input = $($el);
					var attributeName = $input.attr(ATTRIBUTES.name);
					var inputType = $input.attr(ATTRIBUTES.type);
					var matchingQuestionAndAnswerPattern = this.isItQuestionAndAnswerElement(attributeName);
					var group = inputType === SELECTORS.radio ? SELECTORS.radioGroup : SELECTORS.checkboxGroup;
					var questionText = $input.closest(group).find("." + inputType + "-group-label").text();

					if (matchingQuestionAndAnswerPattern) {
						if (typeof this.questionsObject[attributeName] === UNDEFINED && questionText) {
							this.questionsObject[attributeName] = {
								questionName: questionText
							};
						}
						this.createQuestionAndValuesObject(attributeName);
					}

				}.bind(this));
				this.preparePromotigoAnalyticsdata();
			}
		},
		createQuestionAndValuesObject: function(attributeName) {
			this.questionsObject[attributeName].values = [];
			this.$el.find("input[name=" + attributeName + "]:checked").map(function(index, element) {
				var $element = $(element);
				var inputType = $element.attr(ATTRIBUTES.type);
				var selectedInputText = $element.closest("." + inputType).find("span").text();
				this.questionsObject[attributeName].values.push({
					inputValue: $element.val(),
					inputLabel: selectedInputText
				});
			}.bind(this));
		},
		preparePromotigoAnalyticsdata: function() {
			var questionAndAnswers = [];
			for (var property in this.questionsObject) {
				if (this.questionsObject.hasOwnProperty(property)) {
					if (typeof this.questionsObject[property].values !== UNDEFINED && this.questionsObject[property].values.length > 0) {
						var answers = this.questionsObject[property].values.map(function(item) {
							return item.inputLabel;
						}).join(",");
						questionAndAnswers.push(this.questionsObject[property].questionName + " : " + answers);
					}
				}
			}
			if (questionAndAnswers.length > 0) {
				this.questionsAndAnswerString = questionAndAnswers.join(" | ");
			}
		},
		updatePromotigoQuestionAndAnswerObjectOnChangeOfDropdown: function() {
			if (this.isThisPromotigoForm) {
				this.$selectDropdowns.each(function(index, element) {
					var $element = $(element);
					var attributeName = $element.attr(ATTRIBUTES.name);
					var isItQuestionAndAnswerDropDown = this.isItQuestionAndAnswerElement(attributeName);
					if (isItQuestionAndAnswerDropDown) {
						var questionText = $element.closest(SELECTORS.selectField).find(SELECTORS.controlLabel).text();
						if (typeof this.questionsObject[attributeName] === UNDEFINED && questionText) {
							this.questionsObject[attributeName] = {
								questionName: questionText
							};
						}
						var selectedValues = $element.val();
						var selectedOptionText = $element.find(SELECTORS.selectedOption).text();
						this.questionsObject[attributeName].values = [];
						if (selectedValues) {
							this.questionsObject[attributeName].values.push({
								inputValue: selectedValues,
								inputLabel: selectedOptionText
							});
						}
						this.preparePromotigoAnalyticsdata();
					}
				}.bind(this));
			}
		},
		fireSurveyEditAnalytics: function() {
			if (this.isThisPromotigoForm) {
				Cog.fireEvent("promotigo.analytics", "editQuestionAndAnswerFields", {
					componentPosition: this.componentPosition,
					questionAndAnswers: this.questionsAndAnswerString
				});
			}
		}
	};

	clearForm = function($form, oldbrowser) {
		$form.find("input:text, input:password, input:file, select, textarea").val("");
		$form.find("input:radio").prop("checked", false);
		$form.find("input:checkbox").prop("checked", false);

		if (oldbrowser) {
			$form.find("input:text, input:password, input:file, select, textarea").blur();
		}
	};

	autoFillForm = function($form, formData) {
		formData = JSON.parse(formData);
		var checkboxFieldInForm = $form.find("input[type=checkbox]");

		checkboxFieldInForm.each(function() {
			if (formData.hasOwnProperty(this.name)) {
				$form.find('[name="' + this.name + '"]').prop("checked", true);
			}
		});

		for (var key in formData) {
			if (formData.hasOwnProperty(key) && key !== ":formstart") {
				if (checkboxFieldInForm.hasOwnProperty(key)) {
					$form.find('[name="' + key + '"]').prop("checked", true);
				} else {
					$form.find("#" + key).val(formData[key]);
				}
			}
		}
	};

	resetForm = function($form) {
		$form[0].reset();
		$form.find("input, textarea").blur();
	};

	manualInputs = (function() {
		function applyStyle($input, $label) {
			if ($input.is(":checked")) {
				$label.addClass("checked");
			} else {
				$label.removeClass("checked");
			}
		}

		return function($inputs) {
			$inputs.each(function(i, input) {
				var $input = $(input),
					$label = $input.parent().find("label");

				$label.on("click", function(ev) {
					ev.preventDefault();
					input.checked = !input.checked;
				});

				applyStyle($input, $label);
				$input.on("change", function() {
					applyStyle($input, $label);
				});
			});
		};
	})();

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		analyticsUtils = this.external.utils;
		formUtils = this.external.formUtils;
		ctConstants = analyticsDef.ctConstants;
		urlUtils = this.external.urlUtils;
		var $form = scope.$scope,
			disabledMessage = "Submit functionality is disabled" +
			" in Edit mode - switch to Preview mode to use it.",
			browser = this.external.browser,
			status = this.external.status;
		var formObject = new Form($form);
		if (formObject.isThisPromotigoForm) {
			Cog.fireEvent("promotigo.analytics", "onPromotigoLaunch", {
				componentPosition: formObject.componentPosition
			});
		}

		$form.find("textarea[maxlength]").bind("change keyup", function() {
			var maxlength = $(this).attr("maxlength"),
				val = $(this).val();

			if (val.length > maxlength) {
				$(this).val(val.substring(0, maxlength));
			}
		});

		manualInputs($form.find("input[type=radio], input[type=checkbox]"));

		$form.find("button.clearButton").bind("click", function() {
			clearForm($(this.form));
		});
		if (browser.msie && browser.version < 10) {
			$form.on("click", "button.clearButton", function() {
				clearForm($(this.form), true);
			});
			$form.find("input.reset").bind("click", function(e) {
				e.preventDefault();
				resetForm($(this.form));
			});
			$form.find("button.editSubmit").bind("click", function(e) {
				if (status.isAuthor()) {
					return true;
				}
				e.preventDefault();
				window.alert(disabledMessage);
			});
		} else {
			$form.on("click", "button.clearButton", function() {
				clearForm($(this.form));
			});
			$form.find("button.editSubmit").bind("click", function(e) {
				if (status.isAuthor()) {
					return true;
				}
				e.preventDefault();
				window.alert(disabledMessage);
			});
		}

		setupForm($form);
	};

	function setupForm($form) {
		var formType = formUtils.determineFormType($form);
		switch (formType) {
			case formUtils.FORM_TYPE.CONTACT_US:
				setupDcsForm($form, {
					submitLabel: "Contact Us Form Submitted",
					submitAction: analyticsDef.ctConstants.forms,
					pageLoadLabel: "Contact Us Form Start",
					pageLoadAction: analyticsDef.ctConstants.contactUsStart
				});
				break;
			case formUtils.FORM_TYPE.SIGN_UP:
				setupDcsForm($form, {
					submitLabel: "Sign Up Form Submitted",
					submitAction: analyticsDef.ctConstants.forms,
					pageLoadLabel: "Sign Up Start",
					pageLoadAction: analyticsDef.ctConstants.signupStart
				});
				break;
			case formUtils.FORM_TYPE.B2B:
				setupDcsForm($form, {
					submitLabel: "B2B Up Form Submitted",
					submitAction: analyticsDef.ctConstants.forms,
					pageLoadLabel: "Microsite Survey Start",
					pageLoadAction: analyticsDef.ctConstants.signupStart
				});
				break;
			case formUtils.FORM_TYPE.CUSTOMER_INFORMATION:
				setupCustomerInformationForm($form);
				break;
			default:
				setupDefault($form);
		}
	}

	function setupCustomerInformationForm($form) {
		$form.on("submit", function(e) {
			sendToShopify($form, e);
		});
		var formDataSession = sessionStorage.getItem("sessionFormData");
		if (formDataSession) {
			autoFillForm($form, formDataSession);
		}
	}

	function sendToShopify($form, event) {
		event.preventDefault();
		var $formElement = $form.find("form.customer-information-form");
		var $formSubmitButton = $form.find(".formButton button[name='submit']");
		var shopifyGatewayAddress = "/sk-eu/services/shopify/customerinformation";
		var adapterParams = JSON.stringify($formElement.data("params"));
		var successRedirect = $formElement.data("success-redirect");
		var errorRedirect = $formElement.data("error-redirect");
		var userFormData = formUtils.arrayToObject($formElement.serializeArray());
		userFormData.params = adapterParams;

		if (formUtils.isFormValid($formElement) && formUtils.isCaptchaValidOrNotExist($form)) {
			$.ajax({
				type: $formElement.attr("method"),
				url: shopifyGatewayAddress,
				data: userFormData,
				contentType: "application/x-www-form-urlencoded; charset=UTF-8",
				beforeSend: function() {
					$formSubmitButton.prop("disabled", "disabled");
				},
				success: function(response) {
					response = JSON.parse(response);
					if (response && response.code && response.code === 200) {
						sessionStorage.setItem("sessionFormData", JSON.stringify(userFormData));
						window.location.href = successRedirect + ".html";
					} else {
						window.location.href = errorRedirect + ".html";
					}
				},
				error: function() {
					window.location.href = errorRedirect + ".html";
				}
			});
		}
	}

	function setupDcsForm($form, config) {
		//default config
		config = config || {
			submitLabel: "Form Submitted",
			submitAction: analyticsDef.ctConstants.forms,
			pageLoadLabel: "Form Start",
			pageLoadAction: analyticsDef.ctConstants.forms
		};
		var name = formUtils.getFormName($form);
		var position = analyticsUtils.getComponentPosition($form.find("form")) || 0;
		var submitLabel = config.submitLabel + " | " + name;
		var pageLoadLabel = config.pageLoadLabel + " | " + name;

		onDcsSubmit($form, submitLabel, config.submitAction, position);
		$(document).ready(function() {
			fireFormEvent(analyticsDef.LOAD.FORM_PAGE, pageLoadLabel,
				config.pageLoadAction,
				position);
		});
	}

	function setupDefault($form) {
		var idValue = $form.find("a[id]").attr("id") || "";
		var name = formUtils.getFormName($form);
		var position = analyticsUtils.getComponentPosition($form.find("form")) || 0;
		var eventAction = analyticsDef.ctConstants.forms;
		var eventLabel = (idValue) ? name + " - " + idValue : name;

		$form.on("submit", function(e) {
			var formType = formUtils.determineFormType($form);
			fireFormEvent(analyticsDef.CLICK.FORM_CLICK, eventLabel, eventAction, position);
			if (formType === formUtils.FORM_TYPE.NEWSLETTER_SIGNUP) {
				e.preventDefault();
				localStorage.setItem("newsletter.signup.email", $form.find("input[type='email']").val());
				window.location.href = $form.find("form").attr("action");
			}
		});
	}

	function onDcsSubmit($form, eventLabel, eventAction, position) {
		$form.on("submit", function(e) {
			sendToDcs($form, e);
			var formObject = new Form($form);
			if (!formObject.isThisPromotigoForm) {
				fireFormEvent(analyticsDef.CLICK.FORM_CLICK, eventLabel, eventAction, position);
			}
			var $optInCorporate = $form.find(SELECTORS.optincorporate);
			if ($optInCorporate.length > 0 && $optInCorporate.is(ATTRIBUTES.checked)) {
				analyticsUtils.addTrackedEvent(ctConstants.Acquisition,
					"BRAND OPTIN/CORPORATE OPTIN",
					ctConstants.conversion,
					ctConstants.lead);
			}
		});
	}

	function onDcsSuccess($form) {
		var formType = formUtils.determineFormType($form);
		var formName = formUtils.getFormName($form);
		var position = analyticsUtils.getComponentPosition($form.find("form")) || 0;
		if (formType === formUtils.FORM_TYPE.CONTACT_US) {
			fireFormEvent(analyticsDef.SUBMIT.FORM,
				"Contact us Form Submit | " + formName,
				analyticsDef.ctConstants.contactUsSubmit,
				position);
		} else {
			fireFormEvent(analyticsDef.SUBMIT.FORM,
				"Successful Sign Up | " + formName,
				analyticsDef.ctConstants.signupSubmit,
				position);
		}
	}

	function onDcsError(resp, $formElement) {
		var response = resp || {};
		var errorMessage = response.responseText || "unknown server error";
		Cog.fireEvent("form", analyticsDef.SUBMIT.SERVER_ERROR, {
			errorMessage: errorMessage,
			$formElement: $formElement
		});
	}

	/* We want to remove question fields for radio buttons from serialized
	 * form object, as we need custom values being sent to backend */
	function removeQuestionProperties($form, userFormData) {
		var newUserFormData = userFormData;
		var propertiesToRemove = getRadioPropertiesToRemove($form);
		propertiesToRemove.forEach(function(element) {
			delete newUserFormData[element];
		});
		return newUserFormData;
	}

	/* We collect radio button question field names */
	function getRadioPropertiesToRemove($form) {
		var properties = [];
		$form.find("input[type='radio'][name^='question']").each(function(key, element) {
			var property = $(element).attr("name");
			if (properties.indexOf(property) === -1) {
				properties.push(property);
			}
		});
		return properties;
	}

	/* We collect new custom field values from form */
	function getQuestionAnswers($form) {
		var questionAnswers = {};
		$form.find("input[type='checkbox'][name^='question'][name*='answer']").each(function(key, element) {
			var $element = $(element);
			var property = $element.attr("name");
			var value = $element.is(":checked");
			questionAnswers[property] = value;
			var questionText = getSiblingLabel($element, "span.checkbox-label-text");
			if (questionText) {
				questionAnswers[property + "_text"] = questionText;
			}
		});
		$form.find("input[type='radio'][name^='question']").each(function(key, element) {
			var $element = $(element);
			var propertyName = $element.attr("name") + "_answer_" + $element.val();
			var isChecked = $element.is(":checked");
			if (isChecked) {
				questionAnswers[propertyName] = isChecked;
				var questionText = getSiblingLabel($element, "span.radio-label-text");
				if (questionText) {
					questionAnswers[propertyName + "_text"] = questionText;
				}
			}
		});
		return questionAnswers;
	}

	function getSiblingLabel($element, labelSelector) {
		return $element.siblings(labelSelector).first().text();
	}

	function handleDcsDebug(response) {
		if (response.dcsEndPoint) {
			console.log("DCS EndPoint:", response.dcsEndPoint);
		}
		if (response.dcsRequestBody) {
			console.log("DCS Request:", response.dcsRequestBody);
		}
		if (response.dcsResponse) {
			console.log("DCS Response:", response.dcsResponse);
		}
	}

	function sendToDcs($form, event) {
		event.preventDefault();
		var $formElement = $form.find("form");
		var $formWrapper = $form.find(">.component-content");
		var $formSubmitButton = $form.find(".formButton button[name='submit']");
		var dcsGatewayAddress = "/sk-eu/services/dcs";
		var successRedirect = $formWrapper.data("success-redirect");
		var errorRedirect = $formWrapper.data("error-redirect");
		var winRedirectUrl = $formWrapper.data("win-redirect");
		var lossRedirectUrl = $formWrapper.data("loss-redirect");
		var adapterParams = JSON.stringify($formWrapper.data("adapter-params"));
		var userFormData = formUtils.arrayToObject($formElement.serializeArray());
		userFormData = removeQuestionProperties($formElement, userFormData);
		var formData = $.extend(userFormData, getQuestionAnswers($formElement));
		formData.params = adapterParams;

		var formObject = new Form($form);
		if (formUtils.isFormValid($formElement) && formUtils.isCaptchaValidOrNotExist($form)) {
			$.ajax({
				type: $formElement.attr("method"),
				url: dcsGatewayAddress,
				data: formData,
				contentType: "application/x-www-form-urlencoded",
				beforeSend: function() {
					$formSubmitButton.prop("disabled", "disabled");
				},
				success: function(response) {
					handleDcsDebug(response);
					if (response.success) {
						Cog.Cookie.create("UnileverID", response.unileverId, response.unileverIdTtlInDays);
						if (formObject.isThisPromotigoForm) {
							Cog.fireEvent("promotigo.analytics", "onPromotigoSubmit", {
								componentPosition: formObject.componentPosition,
								questionAndAnswers: formObject.questionsAndAnswerString
							});

							if (response.dcsResponse) {
								var dcsResponse = JSON.parse(response.dcsResponse);

								if (dcsResponse.responseData.results) {
									dcsResponse = dcsResponse.responseData.results[0];
								} else {
									dcsResponse = null;
								}

								if (dcsResponse && typeof dcsResponse.Entry !== "undefined" && dcsResponse.Entry.hasOwnProperty("Win") && dcsResponse.Entry.Win.toLowerCase() === "true") {
									window.location.href = winRedirectUrl + ".html";
									return false;
								} else if (dcsResponse && typeof dcsResponse.Entry !== "undefined" && dcsResponse.Entry.hasOwnProperty("Win") && dcsResponse.Entry.Win.toLowerCase() === "false") {
									window.location.href = lossRedirectUrl + ".html";
									return false;
								}
							}

						} else {
							onDcsSuccess($form);
						}

						window.location.href = successRedirect + ".html";
					} else {
						onDcsError(response, $formElement);
						window.location.href = errorRedirect + ".html";
					}
				},
				error: function(response) {
					onDcsError(response, $formElement);
					window.location.href = errorRedirect + ".html";
				}
			});
		}
	}

	function fireFormEvent(eventType, eventLabel, eventAction, position) {
		Cog.fireEvent("form", eventType, {
			label: eventLabel,
			action: eventAction || analyticsDef.ctConstants.forms,
			componentPosition: position
		});
	}

	Cog.registerComponent({
		name: "form",
		api: api,
		selector: ".form",
		requires: [{
				name: "utils.browser",
				apiId: "browser"
			},
			{
				name: "utils.status",
				apiId: "status"
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
				name: "utils.form",
				apiId: "formUtils"
			},
			{
				name: "utils.url",
				apiId: "urlUtils"
			}
		]
	});
}(Cog.jQuery()));
