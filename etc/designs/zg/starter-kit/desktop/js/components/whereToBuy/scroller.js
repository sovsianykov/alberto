(function() {
	"use strict";

	var Scroller = {
		go: function($holder, selector, index) {
			var $elm = $holder.find(selector).eq(index);
			this.goToElement($elm);
		},

		goToElement: function($holder, $elm) {
			var viewportTop = $holder.scrollTop();
			var itemTop = $elm.offset().top - $holder.offset().top + viewportTop;
			var middle = ($holder.height() - $elm.outerHeight()) * 0.5;

			$holder.stop().animate({
				scrollTop: itemTop - middle
			}, 300, "swing");
		},

		goToElementMobile: function($holder, $elm) {
			$holder.stop().animate({
				scrollTop: $elm.offset().top
			}, 300, "swing");
		}
	};

	var idx, bindAll;
	var api = {
		init: function() {
			idx = this.external.idx;
			bindAll = this.external.bindAll;
		}
	};

	Cog.registerStatic({
		name: "whereToBuy.scroller",
		api: api,
		sharedApi: Scroller,
		requires: [{
			name: "utils.idx",
			apiId: "idx"
		},{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});

})(Cog.jQuery());

