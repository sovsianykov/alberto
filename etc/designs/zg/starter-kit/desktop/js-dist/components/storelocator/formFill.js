(function() {
	"use strict";

	function FormFill($holder) {
		this.$holder = $holder;

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);
	}

	FormFill.prototype = {
		deserialize: function(str) {
			return (str || "").split("&")
				.map(function(item) {
					var split = item.split("=");
					return {
						name: split[0],
						value: decodeURIComponent((split[1] || "").replace(/\+/g, " "))
					};
				})
				.filter(function(item) {
					return item.name !== "";
				});
		},
		run: function(urlData) {
			this.deserialize(urlData || document.location.search.substring(1))
				.forEach(this.fn(function(val) {
					this.$holder.find("[name='" + val.name + "']").val(val.value);
				}));

			var emptyFields = this.$holder.find("[required]")
				.toArray()
				.filter(function(elm) {
					return elm.value === "";
				}).length > 0;

			if (!emptyFields) {
				Cog.fireEvent("formFill", "dataFromURL", {
					instance: this
				});
			}
			return emptyFields;
		}
	};

	var bindAll;
	var api = {
		// use init to make dependencies available to this module.
		init: function() {
			bindAll = this.external.bindAll;
		}
	};

	Cog.registerStatic({
		name: "storelocator.formFill",
		api: api,
		sharedApi: FormFill,
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		}]
	});
}());
