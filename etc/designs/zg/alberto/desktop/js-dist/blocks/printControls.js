(function($) {
	"use strict";

	var api = {};
	var hasPrintActions;
	var $body = $("body");
	var previewClass = "print-preview";
	var $printIconTemplate;
	var KEYS = {
		enter: 13,
		esc: 27
	};

	function PrintControls($el) {
		this.$el = $el;

		$printIconTemplate = this.$el.find(".print-preview-trigger").detach();
		$body.append(this.$el); // move to bottom of page

		this.bindUIEvents();
	}

	PrintControls.prototype.bindUIEvents = function() {

		if (!hasPrintActions) {
			hasPrintActions = true; // make sure these events don't get applied twice

			$body.on("click", "[data-action='print']", function(e) {
				e.preventDefault();
				this.printFromPreview();
			}.bind(this));

			$body.on("click", "[data-action='close-preview']", function(e) {
				e.preventDefault();
				this.previewClose();
			}.bind(this));

			$body.on("mouseup keydown", "[data-action='show-preview']", function(e) {
				if (e.type === "mouseup") {
					e.preventDefault();
					this.previewOpen();
				} else if (e.keyCode === KEYS.enter) {
					this.previewOpen();
				}
			}.bind(this));
		}

		Cog.addListener("storelocator", "results:select", this.addPrintIcon);

	};

	PrintControls.prototype.addPrintIcon = function() {
		_.defer(function() {
			var $currentStore = $(".storeresults-list > .active");
			$currentStore.find(".storeresults-name").prepend($printIconTemplate);
		}, 50);
	};

	PrintControls.prototype.previewOpen = function() {
		$(window).scrollTop(0);
		$body.addClass(previewClass);
	};

	PrintControls.prototype.previewClose = function() {
		$body.removeClass(previewClass);
	};

	PrintControls.prototype.printFromPreview = function() {
		window.print();
	};

	api.onRegister = function(scope) {
		new PrintControls(scope.$scope);
	};

	Cog.registerComponent({
		name: "printControls",
		api: api,
		selector: ".parametrizedhtml.reference-print-controls",
		requires: []
	});

})(Cog.jQuery());
