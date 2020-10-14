(function($) {
	"use strict";

	function ToggleCategoryAndFilter($el) {
		this.$el = $el;
		bindAll(this);
		this.init();
		
	}

	ToggleCategoryAndFilter.prototype = {
		init: function() {
			this.$el.find(".cta-cancel").click(this.removeClasses);
			$(".cta-filter-mobile").click(this.addClassFilter);
			$(".cta-select-category").click(this.addClassCategory);
			$(".button-clear-filters").click(this.clearFilters);
			$(_ckbox + "-input," + _radioButton + "-input").change(this.checkFilterActive);
			$(_ckbox + "-title, " + _radioButton + "-title").click(this.openItem);
			this.checkFilterActive();
		},
		addClassFilter: function() {
			this.$el.addClass("show-filter");
		},
		addClassCategory: function() {
			this.$el.addClass("show-category");
		},
		removeClasses: function() {
			this.$el.removeClass("show-category show-filter");
		},
		checkFilterActive: function() {
			if ($(_ckbox + "-input:checked," + _radioButton + "-input:checked").length) {
				this.$el.addClass(_hasFilters);
			} else {
				this.$el.removeClass(_hasFilters);
			}
		},
		clearFilters: function() {
			$(_ckbox + "-input," + _radioButton + "-input").prop("checked", false);
			this.$el.removeClass(_hasFilters);
			Cog.fireEvent("checkboxFilters", "clearFilters");
		},
		openItem: function(event) {
			var parent = $(event.target).parents(_ckbox);
			var isActive = parent.hasClass(_active);

			$(_ckbox).removeClass(_active);
			if (!isActive) {
				parent.addClass(_active);
			}
		}
	};

	var _active = "is-active";
	var _hasFilters = "has-filters";
	var _ckbox = ".listingCheckBoxesFilter";
	var _radioButton = ".listingRadioFilter";
	var bindAll;
	var api = {
		onRegister: function(scope) {
			bindAll = bindAll || this.external.bindAll;
			new ToggleCategoryAndFilter(scope.$scope);
		}
	};

	// Add filter functionalaty on mobile
	// on Product landing pages
	if ($("body").hasClass("template-product-landing-page") && $(".product-navigation-select").length < 1) {
		var productsWraper = $(".product-results-wrapper > .component-content > .paragraphSystem");
		var label = $("<label for='mobileCategoryNavigation'>")
			.text("Product category navigation");
		var select = $("<select id='mobileCategoryNavigation' aria-label='Product category navigation'>")
			.addClass("product-navigation-select");
		select.appendTo(label);
		label.prependTo(productsWraper);

		var links = $(".product-filters-and-category-navigation .navigation a");

		$(links).each(function(index) {
			if ($(this).parent().hasClass("navigation-level2")) {
				select.append($("<option>").attr("value", index).text(" • " + this.text).attr("data-link", this.href));
			} else {
				select.append($("<option>").attr("value", index).text(this.text).attr("data-link", this.href));
			}

			// check if parent is active
			// if so than select it as the selected option
			if ($(this).parent().hasClass("is-active")) {
				select.val(index);
			}
		});

		select.change(function() {
			var element = $(this).find("option:selected"); 
			var link = element.attr("data-link");
			window.location.href = link;
		});
	}

	Cog.registerComponent({
		name: "product.toggleCategoryAndFilter",
		api: api,
		selector: ".product-filters-and-category-navigation",
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});
})(Cog.jQuery());
