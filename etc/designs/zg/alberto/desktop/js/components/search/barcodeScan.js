(function($) {
	"use strict";
	var api = {};
	var codeReader;
	var ZXing;
	var SELECTORS = {
		barScanCode: ".barcodescan",
		barScanContainer: ".barscan-container",
		barScanEnable: "barscan-enabled",
		searchQueryInput: ".searchBoxWithSuggestions .search-query",
		searchBoxForm: ".searchBoxWithSuggestions .form-search",
		barScanVideoId: "barscan-video-streaming",
		barScanScript: "barcode-js-lazyLoad",
		searchOverlayContent: ".search-overlay .overlay-content",
		barScanClose: ".close-barscan"
	};
	var ATTRIBUTES = {
		dataSrc: "data-src"
	};
	var keys = {
		enter: 13
	};

	function BarcodeScan($el) {
		this.$el = $el;
		ZXing = window.ZXing;
		this.bindUIEvents();
		Cog.addListener("barcodeScan", "BAR_CODE_SCAN_RESET", function() {
			$(SELECTORS.searchOverlayContent).removeClass(SELECTORS.barScanEnable);
			codeReader.reset();
		}.bind(this));
	}
	BarcodeScan.prototype.bindUIEvents = function() {
		this.$el.find(SELECTORS.barScanCode).on("click", function() {
			this.barcodeInit();
		}.bind(this)).on("keypress", function(event) {
			if (event.keyCode === keys.enter) {
				this.barcodeInit();
			}
		}.bind(this));
		this.$el.find(SELECTORS.barScanClose).on("click", function() {
			Cog.fireEvent("barcodeScan", "BAR_CODE_SCAN_RESET");
		}.bind(this)).on("keypress", function(event) {
			if (event.keyCode === keys.enter) {
				Cog.fireEvent("barcodeScan", "BAR_CODE_SCAN_RESET");
			}
		}.bind(this));
		this.$el.find(SELECTORS.barScanCode).appendTo(SELECTORS.searchOverlayContent);
	};
	BarcodeScan.prototype.barcodeInit = function() {
		$(SELECTORS.searchOverlayContent).addClass(SELECTORS.barScanEnable);
		this.loadAvailableSources();
	};
	BarcodeScan.prototype.startBarScan = function(selectedDeviceId) {
		codeReader.decodeFromVideoDevice(selectedDeviceId, SELECTORS.barScanVideoId, function(result, err) {
			if (result) {
				$(SELECTORS.barScanContainer).hide();
				$(SELECTORS.searchQueryInput).val(result.text);
				$(SELECTORS.searchBoxForm).trigger("submit");
			} else if (err && !(err instanceof ZXing.NotFoundException)) {
				console.error(err);
			}
		});
	};
	BarcodeScan.prototype.loadAvailableSources = function() {
		codeReader = new ZXing.BrowserMultiFormatReader();
		var self = this;
		codeReader.getVideoInputDevices()
			.then(function(videoInputDevices) {
				self.startBarScan(videoInputDevices[0].deviceId);
			}, function(err) {
				console.error(err);
			});
	};
	api.onRegister = function(scope) {
		if ("ZXing" in window) {
			new BarcodeScan(scope.$scope);
		} else {
			Cog.addListener("barcodeScan", "BAR_CODE_SCAN_LAZYLOAD", function() {
				new BarcodeScan(scope.$scope);
			}.bind(this));
		}
	};
	var load = function() {
		var barcodeLazyLoadJs = document.getElementById(SELECTORS.barScanScript);
		if (barcodeLazyLoadJs && barcodeLazyLoadJs.getAttribute(ATTRIBUTES.dataSrc)) {
			barcodeLazyLoadJs.src = barcodeLazyLoadJs.getAttribute(ATTRIBUTES.dataSrc);
			barcodeLazyLoadJs.removeAttribute(ATTRIBUTES.dataSrc);
			barcodeLazyLoadJs.addEventListener("load", function() {
				Cog.fireEvent("barcodeScan", "BAR_CODE_SCAN_LAZYLOAD");
			});
		}
	};
	window.runOnWindowLoad(load);
	Cog.registerComponent({
		name: "scanbarcode",
		api: api,
		selector: ".scanbarcode"
	});
})(Cog.jQuery());
