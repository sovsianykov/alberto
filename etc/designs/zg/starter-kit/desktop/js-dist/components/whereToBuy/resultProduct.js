(function($) {
	"use strict";

	function ResultProduct($holder, $smartbutton) {
		this.$holder = $holder;
		this.$smartbuttonHolder = $smartbutton.parent();
		this.$image = $holder.find(".storelocator-product-image");
		this.$content = $holder.find(".storelocator-product");
		this.$title = this.$content.find(".storelocator-prefix");
		this.config = this.$content.closest(".storelocator-form").data("storelocator");
		$smartbutton.remove();
		$holder.find(".where-to-buy-edit").attr("tabindex", "0").attr("role", "button");

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
	}

	ResultProduct.prototype = {
		reset: function() {
			this.$image.html("");
			this.$content.html("");
			this.$smartbuttonHolder.find(".buyitnow").remove();
			this.$content.append(this.$title);
		},

		update: function(data) {
			this.reset();
			this.$image.append(data.$image);
			this.$title.text(data.title);
			this.$content.append($("<div class='storelocator-result-size'></div>").text(this.config.resultsSizeLabel + data.selectedSize));
			this.$content.append(this.processRatingStars(data.$rating.clone(true)));
			this.$content.append(data.$edit);
			this.$smartbuttonHolder.append(data.$smartbutton.clone(true));
		},

		processRatingStars: function($rating) {
			// input;  <div><svg><path style="fill: url(#foo)"/><linearGradient id="foo"/></svg>...</div>
			// output; <div><svg><path style="fill: url(#foo-123123)"/><linearGradient id="foo-123123"/></svg>...</div>
			// the IDs need to be unique on the page, so the SVG will
			// be able to find the gradients
			var updateBackgroundID = function(i, el) {
				var $el = $(el);
				var $linearGradient = $el.find("linearGradient[id]");
				var id = $linearGradient.attr("id");
				var newId = id + "-" + (+ (new Date()));
				var $updateEls = $el.children("[style*='#" + id + "']");

				$linearGradient.attr("id", newId);
				$updateEls.each(function(i, el) {
					$(el).attr("style", "fill: url(#" + newId + ") !important");
				});
			};
			var $svgs = $rating.find("svg");
			$svgs.each(updateBackgroundID);
			return $rating;
		}
	};

	var idx, breakpoints, SimpleState, bindAll;
	var api = {
		init: function() {
			breakpoints = breakpoints || this.external.breakpoints;
			SimpleState = SimpleState || this.external.SimpleState;
			idx = idx || this.external.idx;
			bindAll = bindAll || this.external.bindAll;
		}
	};

	Cog.registerStatic({
		name: "whereToBuy.resultProduct",
		api: api,
		sharedApi: ResultProduct,
		requires: [{
			name: "utils.idx",
			apiId: "idx"
		},{
			name: "utils.bindAll",
			apiId: "bindAll"
		},{
			name: "utils.simpleState",
			apiId: "SimpleState"
		}]
	});
})(Cog.jQuery());
