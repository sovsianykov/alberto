(function($) {
	"use strict";

	var api = {};
	var events;
	var utils;
	var ctConstants;
	var EMPTY_COMPONENT_POSITION = "";
	var NOT_APPLICABLE = "(not set)";

	api.init = function() {
		events = this.external.eventsDefinition.CLICK;
		utils = this.external.utils;
		ctConstants = this.external.eventsDefinition.ctConstants;
		addEventListeners();
	};

	function addEventListeners() {
		if (utils.isAnalyticsConfigured()) {
			Cog.addListener("accordion", events.ACCORDION_CLICK, accordionHandler);
			Cog.addListener("articleList", events.ARTICLE_LINK, articleLinkClickHandler);
			Cog.addListener("listingAnalytics", events.ARTICLE_LINK, articleLinkClickHandler);
			Cog.addListener("carousel", events.CAROUSEL_CLICK, carouselClickHandler);
			Cog.addListener("image", events.IMAGE_CLICK, imageClickHandler);
			Cog.addListener("productQuickView", events.PRODUCT_QUICK_VIEW, quickViewHandler);
			Cog.addListener("quizCta", events.QUIZ_CTA, quizCtaHandler);
			Cog.addListener("quizResult", events.QUIZ_RESULT, quizResultHandler);
			Cog.addListener("imageGallery", events.IMAGE_GALLERY_CLICK, imageGalleryHandler);
			Cog.addListener("addThis", events.ADDTHIS_SHARE, addThisHandler);
			Cog.addListener("tabs", events.TABS_CLICK, tabsHandler);
			Cog.addListener("searchFilter", events.SEARCH_FILTER, searchFilterHandler);
			Cog.addListener("searchBoxWithSuggestions", events.SITE_SEARCH, searchBoxHandler);
			Cog.addListener("refineSearchBox", events.SITE_SEARCH, searchBoxHandler);
			Cog.addListener("tagList", events.TAGS_CLICK, tagListHandler);
			Cog.addListener("productVariant", events.PRODUCT_VARIANT_CLICK, productVariantHandler);
			Cog.addListener("link", events.LINK_CLICK, linkClickHandler); //cross-component link tracking
			Cog.addListener("virtualAgent", events.VIRTUAL_AGENT_CLICK, virtualAgentHandler);
			Cog.addListener("smartlabel", events.SMARTLABEL_CLICK, smartlabelHandler);
			Cog.addListener("showMoreButton", events.LOAD_MORE_CLICK, showMoreHandler);
			Cog.addListener("form", events.FORM_CLICK, formHandler);
			Cog.addListener("recipe", events.RECIPE_TO_BASKET, recipeToBasketHandler);
			Cog.addListener("livechat", events.LIVECHAT_BUTTON_CLICK, livechatHandler);
		}
	}

	function accordionHandler(event) {
		var label = digitalData.page.pageInfo.pageName + " - " + event.eventData.query;
		utils.pushComponent("Accordion", event.eventData.componentPosition);
		utils.addTrackedEvent(ctConstants.accordianClicked, label);
	}

	function articleLinkClickHandler(event) {
		utils.pushComponent("Article List", event.eventData.componentPosition);
		utils.addTrackedEvent(ctConstants.articleClick, event.eventData.query);
	}

	function carouselClickHandler(event) {
		var label = digitalData.page.pageInfo.pageName + " - " + event.eventData.query;
		utils.pushComponent("Carousel", event.eventData.componentPosition);
		utils.addTrackedEvent(ctConstants.carouselClick, label);
	}

	function imageClickHandler(event) {
		utils.pushComponent("Image", event.eventData.componentPosition);
		utils.addTrackedEvent(ctConstants.imageclick, event.eventData.altText);
	}

	function quizCtaHandler(event) {
		var label;
		var data = event.eventData;

		if (data.isStartPage) {
			label = data.answer;
		} else {
			label = data.answer + " - " + data.nextSlideUrl + " - Question " + data.slideNumber;
		}
		utils.pushComponent("Diagnostioc Tool", data.componentPosition, ctConstants.engagement, ctConstants.interest, prepareQuizAttributes(data));
		utils.addTrackedEvent(ctConstants.diagtoolcta, label, ctConstants.engagement, ctConstants.interest);
	}

	function quizResultHandler(event) {
		var data = event.eventData;
		var label = prepareQuizProductTitles(data.productEans);
		data.result = label;
		utils.pushComponent("Diagnostioc Tool", data.componentPosition, ctConstants.custom, ctConstants.interest, prepareQuizAttributes(data));
		utils.addTrackedEvent(ctConstants.DiagnosticToolResults, label, ctConstants.custom, ctConstants.interest, {}, ctConstants.diagtooleve);
	}

	function prepareQuizProductTitles(productEans) {
		var titles = [];
		productEans.forEach(function(ean) {
			titles.push(allProducts[ean].shortTitle);
		});
		return titles.join(" - ");
	}

	function prepareQuizAttributes(data) {
		return {
			position: data.componentPosition,
			listPosition: "",
			DTQns: data.question || NOT_APPLICABLE,
			DTAns: data.answer || NOT_APPLICABLE,
			DTResult: data.result || NOT_APPLICABLE,
			DTMSARes: NOT_APPLICABLE
		};
	}

	function imageGalleryHandler(event) {
		utils.pushComponent("Image Gallery", event.eventData.componentPosition);
		utils.addTrackedEvent(ctConstants.imageclick, event.eventData.query);
	}

	function addThisHandler(event) {
		utils.pushComponent("Add This", event.eventData.position);
		utils.addTrackedEvent(ctConstants.addthisshare, event.eventData.channel, ctConstants.advocacy, "Lead");
	}

	function tabsHandler(event) {
		var label = digitalData.page.pageInfo.pageName + " - " + event.eventData.label;
		utils.pushComponent("Tabs", event.eventData.componentPosition);
		utils.addTrackedEvent(ctConstants.tabClick, label);
	}

	function searchBoxHandler(event) {
		utils.pushComponent(event.eventData.type, event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		utils.setSearchData(event.eventData.keyword, event.eventData.resultNumber || "");
		utils.addTrackedEvent(event.eventData.action, event.eventData.label, ctConstants.engagement, ctConstants.interest);
	}

	function searchFilterHandler(event) {
		utils.pushComponent("Search Filter", event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.filter, event.eventData.filterOption, ctConstants.engagement, ctConstants.interest);
	}

	function quickViewHandler(event) {
		var productData = allProducts[event.eventData.ean] || {};
		var product = utils.createProduct(productData);
		utils.pushProduct(product);
		utils.pushComponent("Product Quick View", event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.productQuickView, productData.shortTitle || "", ctConstants.engagement, ctConstants.interest);
	}

	function tagListHandler(event) {
		utils.pushComponent("Tag List", event.eventData.componentPosition);
		utils.addTrackedEvent(ctConstants.tags, event.eventData.tagName);
	}

	function productVariantHandler(event) {
		var productData = allProducts[event.eventData.ean] || {};
		utils.pushComponent("Product Variant", event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.filter, productData.productSize || "", ctConstants.engagement, ctConstants.interest);
	}

	function formHandler(event) {
		utils.pushComponent("Form", event.eventData.componentPosition);
		utils.addTrackedEvent(event.eventData.action, event.eventData.label);
	}

	function isSmartLabel(href) {
		return href.includes("smartlabel");
	}

	//handles clicks tracked with trackLinks util
	function linkClickHandler(event) {
		var label;
		var href = event.eventData.href;
		var isExternalLinkClick = utils.isExternalLink(href, isSmartLabel(href));
		var category = getCategory(isExternalLinkClick, event);
		var subcategory = getSubCategory(isExternalLinkClick, event);

		utils.pushComponent(event.eventData.componentName, event.eventData.componentPosition, category, subcategory);

		if (isExternalLinkClick) {
			label = digitalData.page.pageInfo.pageName + " - " + event.eventData.label + " - " + event.eventData.href;
			utils.addTrackedEvent(ctConstants.ExternalLink, label, category, subcategory);
		} else if (event.eventData.type === ctConstants.cta) {
			label = event.eventData.componentName + " - " + event.eventData.label + " - " + event.eventData.href;
			utils.addTrackedEvent(ctConstants.callToAction, label, category, subcategory);
		} else if (event.eventData.type === ctConstants.article) {
			label = event.eventData.href;
			utils.addTrackedEvent(ctConstants.articleClick, label, category, subcategory);
		} else if (event.eventData.type === ctConstants.relatedArticle) {
			label = event.eventData.href;
			utils.addTrackedEvent(ctConstants.relatedArticle, label, category, subcategory);
		} else if (event.eventData.type === ctConstants.product) {
			var productData = allProducts[event.eventData.ean] || {};
			var product = utils.createProduct(productData);
			label = productData.shortTitle + " : " + event.eventData.ean;
			utils.pushProduct(product);
			utils.addTrackedEvent(ctConstants.productclick, label);
		} else if (event.eventData.type === ctConstants.navigation) {
			label = "Global Navigation - " + event.eventData.label + " - " + event.eventData.href;
			utils.addTrackedEvent(ctConstants.linkClick, label, category, subcategory);
		} else if (isRecipePage()) {
			var pageTitle = $('meta[property="og:title"]').attr("content");
			label = pageTitle + " - " + event.eventData.label + " - " + event.eventData.href;
			utils.addTrackedEvent(ctConstants.clicktoaction, label, category, subcategory);
		} else {
			label = digitalData.page.pageInfo.pageName + " - " + event.eventData.label + " - " + event.eventData.href;
			utils.addTrackedEvent(ctConstants.linkClick, label, category, subcategory);
		}
	}

	function getSubCategory(isExternalLinkClick, event) {
		var subcategory;
		if (isRecipePage()) {
			subcategory = ctConstants.read;
		} else if (isExternalLinkClick) {
			subcategory = "Others";
		} else {
			subcategory = event.eventData.subcategory;
		}
		return subcategory;
	}

	function getCategory(isExternalLinkClick, event) {
		var category;
		if (isRecipePage() || isExternalLinkClick) {
			category = ctConstants.custom;
		} else {
			category = event.eventData.category;
		}
		return category;
	}

	function isRecipePage() {
		return digitalData.page.category.pageType === "Recipe Detail" ||
			digitalData.page.category.pageType === "Recipe Landing" ||
			digitalData.page.category.pageType === "Recipe Category" ||
			digitalData.page.category.pageType === "Recipe Listing";
	}

	function virtualAgentHandler(event) {
		utils.pushComponent("Virtual Agent", event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.virtualagent, event.eventData.label, ctConstants.engagement, ctConstants.interest);
	}

	function smartlabelHandler(event) {
		var label = (event.eventData.pageType === "Product Detail") ? "PDP" : event.eventData.pageType;
		utils.pushComponent("Smartlabel", EMPTY_COMPONENT_POSITION, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.smartlabelClick, label, ctConstants.engagement, ctConstants.interest);
	}

	function showMoreHandler(event) {
		utils.pushComponent(event.eventData.componentName, event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.loadMore, event.eventData.eventLabel);
	}

	function recipeToBasketHandler(event) {
		var product = utils.createProduct(event.eventData.productData);
		utils.pushProduct(product);
		utils.pushComponent("Scrambled", event.eventData.componentPosition, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.purchase, "Online - " + event.eventData.eventLabel, ctConstants.conversion, ctConstants.lead);
	}

	function livechatHandler() {
		utils.pushComponent(ctConstants.chat, ctConstants.chatopen, ctConstants.engagement, ctConstants.interest);
		utils.addTrackedEvent(ctConstants.chat, ctConstants.chatopen, ctConstants.engagement, ctConstants.interest);
	}

	Cog.registerStatic({
		name: "analytics.clickHandlers",
		api: api,
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			},
			{
				name: "analytics.utils",
				apiId: "utils"
			}
		]
	});
}(Cog.jQuery()));
