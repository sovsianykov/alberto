/*jshint -W024 */
(function($) {
	"use strict";

	function StoreResultsList($holder, $template, config) {
		this.$holder = $holder;
		this.template = doT.template($template.text());
		this.config = config;
		this.$list = this.$holder.find(".storeresults-list");
		this.index = 0;

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
		this.bindEvents();
	}

	StoreResultsList.prototype = {
		bindEvents: function() {
			Cog.addListener("stores", "results:select", this.onSelect);
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
			Cog.fireEvent("stores", "results:select", {
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
		updateData: function(data) {
			return $.extend({}, data, {
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

		printStores: function(data) {
			this.$list.html(this.template(data));
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
		this.list = new StoreResultsList($holder, $template, config);
		this.cache = new Cache();

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
		this.bindEvents();
		this.refresh();
	}

	Results.prototype = {
		bindEvents: function() {
			this.$more.on("click", this.loadMore);
		},
		// guarantee that received param will be returned (to be used with promise)
		fwd: function(fn) {
			return function(data) {
				var newData = fn(data);
				return newData === undefined ? data : newData;
			};
		},
		fetch: function() {
			var dataToSend = {};
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
					this.$holder.addClass("ready");
				}));
		},

		refresh: function() {
			Cog.fireEvent("stores", "notReady");
			return this.fetch()
				.then(this.fwd(this.fn(function(data) {
					var newData = $.extend({}, data);

					return this.list.updateData(newData);
				})))
				.then(this.fwd(this.list.printStores))
				.then(this.fwd(this.updateState))
				.then(this.fwd(this.checkMore))
				.then(function(data) {
					Cog.fireEvent("stores", "results:refresh", data);
					if (parseInt(data.numStoresFound, 10) === 0) {
						Cog.fireEvent("stores", "results:noResults");
					}
				})
				.fail(this.fn(function() {
					this.$holder.addClass("error");
					Cog.fireEvent("stores", "results:noResults");
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
			Cog.fireEvent("stores", eventsDefinition.OTHER.STORE_LOCATOR_OPTIONS, {
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
		name: "stores.results",
		api: api,
		sharedApi: Results,
		requires: [{
				name: "utils.bindAll",
				apiId: "bindAll"
			}, {
				name: "utils.cache",
				apiId: "Cache"
			}, {
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
			}
		]
	});

})(Cog.jQuery());
