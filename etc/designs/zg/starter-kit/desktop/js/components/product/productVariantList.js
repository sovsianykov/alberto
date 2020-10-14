(function($) {
	"use strict";

	var api = {};
	var analyticsDef;

	// This script is used ONLY for product variants in quickview!
	function ProductVariantList($el) {
		this.$variantLinks = $el.find(".productVariantList-link");

		this.addOnClickListener();
		this.markCurrentVariantAsActive();
	}

	ProductVariantList.prototype = {
		addOnClickListener: function() {
			this.$variantLinks.on("click", function(event) {
				this.ean = $(event.target).attr("href").substr(1);

				Cog.fireEvent("variantList", "variantChanged", {
					ean: this.ean
				});

				Cog.fireEvent("productVariant",	analyticsDef.CLICK.PRODUCT_VARIANT_CLICK, {
					ean: this.ean
				});
			}.bind(this));
		},

		markCurrentVariantAsActive: function() {
			var eans = $(".quickview-content").data();
			var $mainEanLink = this.$variantLinks.filter("[href='#" + eans.mainEan + "']");
			var $currentEanLink = this.$variantLinks.filter("[href='#" + eans.currentEan + "']");

			this.$variantLinks.removeClass("is-active");

			if ($currentEanLink.length) {
				$currentEanLink.addClass("is-active");
			} else {
				$mainEanLink.addClass("is-active");
			}
		}
	};

	api.onRegister = function(scope) {
		analyticsDef = this.external.eventsDefinition;
		new ProductVariantList(scope.$scope);
	};

	Cog.registerComponent({
		name: "productVariantList",
		api: api,
		selector: ".quickview-container .productVariantList",
		requires: [
			{
				name: "analytics.eventsDefinition",
				apiId: "eventsDefinition"
			}
		]
	});
})(Cog.jQuery());