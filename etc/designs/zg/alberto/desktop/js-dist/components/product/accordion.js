(function($) {
	"use strict";

	function AccordionProduct($el) {
		this.$el = $el;
		bindAll(this);
		this.init();
	}

	var KEYS = {
		ENTER: 13
	};

	AccordionProduct.prototype = {
		init: function() {
			var $rootNavigationElements = this.$el.find("li.navigation-level1");
			_.forEach($rootNavigationElements, this.bindEvents.bind(this));
		},
		bindEvents: function(element) {
			var $element = $(element);

			$element.find("> a").on("keydown", function(e) {
				if (e.keyCode === KEYS.ENTER) {
					if (!$element.hasClass("is-active")) {
						e.preventDefault();
					}

					e.target = $element;
					this.onClickTitle(e);
				}
			}.bind(this));

			$element.on("click", this.onClickTitle.bind(this));
		},
		onClickTitle: function(e) {
			var $content = $(e.target);
			var isActive = $content.hasClass("is-active");

			this.$el.find("li.navigation-level1.is-active").removeClass("is-active");

			if (!isActive) {
				$content.addClass("is-active");
			}
		}
	};

	var bindAll;
	var api = {
		onRegister: function(scope) {
			bindAll = bindAll || this.external.bindAll;
			new AccordionProduct(scope.$scope);
		}
	};

	Cog.registerComponent({
		name: "product.accordion",
		api: api,
		selector: ".navigation.side-bar",
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});
})(Cog.jQuery());
