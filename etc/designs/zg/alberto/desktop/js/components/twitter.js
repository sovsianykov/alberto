/**
 * Feed provider
 */

(function($) {
	"use strict";

	var api = {};

	api.preprocess = {
		twitter: function(tweet, settings) {

			function parseDate(date) {
				var values = date.split(" "), parsedDate;
				date = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
				parsedDate = Date.parse(date);

				return new Date(parsedDate);
			}

			function toDateString(date) {
				return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
			}

			var target = settings.blankLinks ? " target=\"_blank\"" : "";
			tweet.text = tweet.text
				.replace(/(^|\s)http:\/\/t.co\/(\w+)/,
				"$1<a href=\"http://t.co/$2\"" + target + ">http://t.co/$2<\/a>")
				.replace(/(^|\s)@(\w+)/g, "$1<a href=\"http:\/\/www.twitter.com\/$2\"" +
				target + ">@<strong>$2</strong><\/a>")
				.replace(/(^|\s)#(\w+)/g,
				"$1<a href=\"http:\/\/twitter.com\/search?q=%23$2&src=hash\"" +
				target + ">#<strong>$2</strong><\/a>");

			var posted = parseDate(tweet.created_at);
			tweet.created_at = toDateString(posted);
			tweet.target = target;

			tweet.retwitted = false;
			if (typeof tweet.retweeted_status !== "undefined") {
				tweet.retwitted = tweet.retweeted_status.user.name;
			}

			return tweet;
		}
	};

	api.onRegister = function(scope) {
		var fp,
			provider,
			content,
			interval,
			getTweets;

		getTweets = function(provider, settings) {
			var self = api;
			$.getJSON(provider, function(data) {
				api.processData.call(self, data, settings, scope);
			});
		};

		api.scope = fp = scope.$scope;
		content = $(fp).find(".component-content");
		provider = content.data("providerPath");
		if (provider) {
			interval = content.data("refresh-interval");
			getTweets.call(fp, provider, content.data());
			if (interval) {
				(function(fp, provider, settings) {
					window.setInterval(function() {
						getTweets.call(fp, provider, settings);
					}, interval * 1000);
				})(fp, provider, content.data());
			}
		}
	};

	api.processData = function(data, settings, scope) {
		if (typeof data.feedType === "undefined") {
			return false;
		}
		var template = api.getTemplate(data.feedType),
			output = "";

		_.forEach(data.statuses, function(feed) {
			if (typeof api.preprocess[data.feedType] === "function") {
				feed = api.preprocess[data.feedType](feed, settings);
			}
			output += _.template(template, feed);
		});

		$(scope.$scope).find(".feed-provider-feeds").html(output);
		Cog.fireEvent("twitter", "feedsLoaded");
		return true;
	};

	api.getTemplate = function(type) {
		return $("." + type + "-template")[0].innerHTML;
	};

	Cog.registerComponent({
		name: "feedProvider",
		api: api,
		selector: ".twitter",
		requires: ["utils.bodySettings"]
	});
})(Cog.jQuery());
