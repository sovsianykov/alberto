/*jshint -W024 */
(function($) {
	"use strict";

	function ResultsList($holder, $template, config) {
		this.$holder = $holder;
		this.template = doT.template($template.text());
		this.config = config;
		this.$intro = this.$holder.find(".storeresults-intro");
		this.$list = this.$holder.find(".storeresults-list");
		this.index = 0;

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
		this.bindEvents();
	}

	ResultsList.prototype = {
		bindEvents: function() {
			Cog.addListener("storelocator", "results:select", this.onSelect);
			Cog.addListener("storelocator", "appendEditButton", this.appendEditButton);
			this.$holder.on("click", ".storeresults-list-wrapper li", this.onClick);
			var componentPosition = analyticsUtils.getComponentPosition(
				this.$holder.closest(".box-store-locator-results"));
			analyticsUtils.trackLinks(this.$list, {
				componentName: ctConstants.storeLocator,
				componentPosition: componentPosition,
				category: ctConstants.engagement,
				subcategory: ctConstants.read
			});
		},
		onClick: function(e) {
			Cog.fireEvent("storelocator", "results:select", {
				index: $(e.currentTarget).index(),
				scroll: false
			});
		},
		onSelect: function(e) {
			this.$list.find("li")
				.removeClass("active")
				.eq(idx(["eventData", "index"], e))
				.addClass("active");
		},
		getMassage: function(data) {
			var message = this.config.resultsTemplateMsg;
			if (parseInt(data.numStoresFound, 10) === 0) {
				message = this.config.resultsErrorMsg;
			} else if (data.isNearest === true) {
				message = this.config.resultsNearestStoreTemplateMsg;
			}
			return message;
		},
		updateData: function(data) {
			var message = this.getMassage(data);
			var nearestStoreDistanceAmount = (data.storeList && data.storeList.length > 0) ? data.storeList[0].distance : "unknown";
			var distanceUnits = this.config.distanceUnits;
			return $.extend({}, data, {
				message: message
					.replace("{nearestStoreDistanceAmount}", nearestStoreDistanceAmount)
					.replace(/\{s\}/g, "<strong>").replace(/\{\/s\}/g, "</strong>")
					.replace(/\{i\}/g, "<strong>").replace(/\{\/i\}/g, "</strong>")
					.replace(/\{em\}/g, "<strong>").replace(/\{\/em\}/g, "</strong>")
					.replace(/\{br\}/g, "<br class=\"storelocator-br\">")
					.replace("{hr}", "<hr class=\"storelocator-hr\">")
					.replace("{storeAmount}", data.numStoresFound)
					.replace("{distanceAmount}", data.distanceAmount)
					.replace("{distanceUnits}", distanceUnits)
					.replace("{productName}", data.productName)
					.replace("{zipCode}", data.zipCode),
				storeList: data.storeList
					// treat store list
					.map(this.fn(function(val) {
						return $.extend(val, {
							directionsUrl: this.config.directionsUrl
								.replace("{lat}", val.latitude)
								.replace("{lng}", val.longitude),
							formattedPhone: val.phone.replace(/\D/g, "")
						});
					}))
					// only return relevant pages for pagination
					.slice(0, (++ this.index) * this.config.itemsPerPage)
			});
		},

		appendEditButton: function(data) {
			var ean = data.ean || data.eventData && data.eventData.ean || 0 ;
			var $cloneEdit;
			if (ean) {
				$cloneEdit = $(".where-to-buy-edit").first().clone();
				$cloneEdit.data("product", {ean: ean});
				$cloneEdit.click(this.gotoStep3);
				$cloneEdit.addClass("last-step");

				this.$intro.append($cloneEdit);
			}
		},

		printStores: function(data) {
			this.$intro.html(data.message);
			this.appendEditButton(data);
			this.$list.html(this.template(data));
		},

		gotoStep3: function(e) {
			var data = $(e.target).data("product");
			Cog.fireEvent("storeLocator", eventsDefinition.CLICK.STORE_LOCATOR_EDIT, {
				position: analyticsUtils.getComponentPosition(
					this.$holder.closest(".box-store-locator-results"))
			});
			Cog.fireEvent("whereToBuy", "goto:step3", data);
			Cog.fireEvent("storelocator", "notReady");
		},

		reset: function() {
			this.index = 0;
		}
	};

	function Results($holder, $template, $form, config) {
		this.config = config;
		this.$holder = $holder;
		this.$form = $form;
		this.$more = this.$holder.find(".storeresults-more");
		this.list = new ResultsList($holder, $template, config);
		this.cache = new Cache();

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
		this.bindEvents();
	}

	Results.prototype = {
		bindEvents: function() {
			this.$form.on("submit", this.onSubmit);
			this.$more.on("click", this.loadMore);
		},

		onSubmit: function(e) {
			e.preventDefault();
			if (!this.$form.hasClass("loading")) {
				this.refresh();
			}
		},
		// guarantee that received param will be returned (to be used with promise)
		fwd: function(fn) {
			return function(data) {
				var newData = fn(data);
				return newData === undefined ? data : newData;
			};
		},
		fetch: function() {
			var dataToSend = this.$form.serialize();
			if (this.cache.has(dataToSend)) {
				return $.Deferred().resolve(this.cache.value(dataToSend));
			}

			this.list.reset();
			this.$form.addClass("loading");

			return $.ajax({
				url: this.config.serviceUrl,
				method: this.$form.attr("method"),
				data: dataToSend,
				dataType: "text",
				beforeSend: urlUtils.addWcmModeIfNeeded
			})
			.always(this.fn(function() {
				this.$form.removeClass("loading");
			}))
			.then(this.fn(function(data) {
				return this.cache.value(dataToSend, JSON.parse(data));
			}))
			.fail(this.fn(function() {
				var ean = $(".box-store-locator-selected-product input[name=ean]").val();
				this.list.$intro.text(this.config.resultsErrorMsg);
				this.$holder.addClass("ready");
				if (ean) {
					Cog.fireEvent("storelocator", "appendEditButton", {ean: ean});
				}
			}));
		},

		refresh: function() {
			Cog.fireEvent("storelocator", "notReady");
			return this.fetch()
				.then(this.fwd(this.fn(function(data) {
					var newData = $.extend({}, data, {
						distanceAmount: this.$form.find(".storelocator-select-radius select").val(),
						productName: this.$form.find(".storelocator-product .storelocator-prefix").text(),
						ean: this.$form.find("input[name=ean]").val(),
						zipCode: this.$form.find(".storelocator-input input").val()
					});
					return this.list.updateData(newData);
				})))
				.then(this.fwd(this.list.printStores))
				.then(this.fwd(this.updateState))
				.then(this.fwd(this.checkMore))
				.then(function(data) {
					Cog.fireEvent("storelocator", "results:refresh", data);
					if (parseInt(data.numStoresFound, 10) === 0) {
						Cog.fireEvent("storelocator", "results:noResults");
					}
					Cog.fireEvent("storeLocator", eventsDefinition.OTHER.STORE_LOCATOR_RESULTS, {
						resultsNumber: data.numStoresFound
					});
				})
				.fail(this.fn(function() {
					this.$holder.addClass("error");
					Cog.fireEvent("storelocator", "results:noResults");
				}));
		},

		updateState: function(data) {
			this.$holder.removeClass("error loading");

			if (!data.success) {
				this.$holder.removeClass("ready");
			} else {
				this.$holder.addClass("ready");
			}
		},

		checkMore: function(data) {
			if (data.isNearest || data.storeList.length === parseInt(data.numStoresFound, 10)) {
				this.$more.parent().hide();
			} else {
				this.$more.parent().show();
			}
		},

		loadMore: function() {
			Cog.fireEvent("storeLocator", eventsDefinition.OTHER.STORE_LOCATOR_OPTIONS, {
				label: "Load More",
				position: analyticsUtils.getComponentPosition(
					this.$holder.closest(".box-store-locator-results"))
			});
			this.refresh();
		}
	};

	var bindAll, idx, Cache;
	var analyticsUtils, eventsDefinition, ctConstants, urlUtils;
	var api = {
		// use init to make dependencies available to this module.
		init: function() {
			bindAll = this.external.bindAll;
			idx = this.external.idx;
			Cache = this.external.Cache;
			analyticsUtils = this.external.analyticsUtils;
			eventsDefinition = this.external.eventsDefinition;
			ctConstants = this.external.eventsDefinition.ctConstants;
			urlUtils = this.external.urlUtils;
		}
	};

	Cog.registerStatic({
		name: "storelocator.results",
		api: api,
		sharedApi: Results,
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		},{
			name: "utils.cache",
			apiId: "Cache"
		},{
			name: "utils.idx",
			apiId: "idx"
		},
		{
			name: "analytics.eventsDefinition",
			apiId: "eventsDefinition"
		},
		{
			name: "analytics.utils",
			apiId: "analyticsUtils"
		},
		{
			name: "utils.url",
			apiId: "urlUtils"
		}]
	});

})(Cog.jQuery());
