(function($) {
	"use strict";

	var KEYS = {
		ENTER: 13,
		ARROWUP: 38,
		ARROWDOWN: 40
	};

	var isMobileNavOpen = false;

	// abstract preventDefault function
	function preventDefault(e) {
		e.preventDefault();
		return e;
	}

	function generateRandomId() {
		var radix = 36;
		var indexStart = 6;

		return Math.random().toString(radix).substring(indexStart);
	}

	function generateNewIds($holder) {
		$holder.find("[id]").each(function() {
			var $elem = $(this);
			var oldId = $elem.attr("id");
			var newId = generateRandomId();

			$elem.attr("id", newId);
			$holder.find("a[data-tab-id='#" + oldId + "']").attr("data-tab-id", "#" + newId);
		});
	}

	function LanguageSelector($holder) {
		this.$holder = $holder;
		this.selectCurrentLanguage();
		this.clone();
		this.makeHolderAccessible();
		this.handleKeyboard();
	}

	LanguageSelector.prototype = {

		open: function() {
			this.$select.addClass("is-enabled");
		},

		close: function() {
			this.$select.removeClass("is-enabled");
		},

		clone: function() {
			// cloning for desktop behaviour (select-box like)
			this.$select = this.$holder.clone();
			this.$select.addClass("navigation-select-box").addClass("select-box");
			this.$holder.after(this.$select);
		},

		selectCurrentLanguage: function() {
			var url = document.location.pathname.split("/");

			this.$holder.find("li[class*='page-'] a").each(function(i, item) {
				var language = (item.parentNode.className.match(/page-(\w+)/) || ["",""])[1].split("_");
				var found = language.filter(function(lng) {
					return url.indexOf(lng) > 0;
				});

				if (language.length === found.length) {
					$(item).addClass("is-active");
				}
			});
		},

		makeHolderAccessible: function() {
			this.$holder.find("a").attr("role", "menuitem");
		},

		handleKeyboard: function() {
			var $link = this.$holder.find(".navigation-item-title, .countrylanguageselector__item__link");
			var $clonedLinks = this.$select.find("a");

			$link.on("focus", function() {
				this.$select.addClass("is-active");
			}.bind(this));

			$link.on("keydown", function(e) {
				if (e.keyCode === KEYS.ENTER) {
					e.preventDefault();
					this.open();
					$clonedLinks.first().focus();
				}
			}.bind(this));

			_.forEach($clonedLinks, function(link, index) {
				var $link = $(link);
				$link.on("focus", _.debounce(this.open.bind(this), 1));
				$link.on("blur", this.close.bind(this));
				$link.on("keydown", function(e) {
					if (e.keyCode === KEYS.ARROWDOWN) {
						e.preventDefault();
						if ($clonedLinks[index + 1]) {
							$($clonedLinks[index + 1]).focus();
						}
					}
					if (e.keyCode === KEYS.ARROWUP) {
						e.preventDefault();
						if ($clonedLinks[index - 1]) {
							$($clonedLinks[index - 1]).focus();
						}
					}
				});
			}.bind(this));
		}
	};

	// mobile header is very different logic from Header,
	// so it has its own class
	function MobileNav($holder) {
		this.$holder = $holder;
		this.$mainWrapper = $("#wrapper");
		this.$currLevel = null;
		this.$currLevel2 = null;
		this.$currLevel3 = null;

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);

		this.buildHTML();
		this.bindEvents();
	}

	MobileNav.prototype = {
		buildHTML: function() {
			// create holders to achieve a structure that fits mobile layout
			this.$navViewport = $("<div class='nav-mobile-viewport' />");
			this.$navWrapper = $("<div class='nav-mobile-wrapper' />");
			this.$navHolder = $("<div class='nav-mobile' />");
			this.$navButton = $("<div class='nav-button' />");
			this.$navButtonClose = $("<div class='nav-button-close' />");
			this.$supplementary = this.$holder.find(".header-supplementary").clone();
			var $backButtonWrapper = $("<div class='back-button-wrapper' />");
			var $tabs = this.$holder.find(".header-main .tabs").clone();

			this.$navViewport.append(this.$navWrapper);
			this.$navWrapper.append(this.$navButtonClose);
			this.$navWrapper.append(this.$navHolder);
			this.$navHolder.append($tabs);
			this.$navHolder.append(this.$supplementary);

			// add real URLs to toplevel links
			$tabs.find(".tabs-nav-item > a").each(function(i, elm) {
				var hash = elm.getAttribute("data-tab-id") || elm.hash;
				var href = $tabs.find(hash).find(".tabContent a").first().attr("href");
				$(elm)
					.attr("data-tab-id", elm.hash)
					.attr("href", href);
			});

			// add "back" buttons for "breadcrumbs effect"
			$tabs.find(".tabs-nav-item > a").each(function(i, elm) {
				var $title = $(elm).find(".tabMenuItem").clone();
				$title.removeClass().addClass("back-button");
				$tabs.find(elm.getAttribute("data-tab-id") || elm.hash).find(".tabContent")
					.prepend($backButtonWrapper.clone().append($title));
			});

			// add "back" buttons for "breadcrumbs effect"
			$tabs.find(".navigation-item.has-children").each(function(i, elm) {
				var $title = $(elm).find("> .navigation-item-title").clone();
				$title.removeClass().addClass("back-button");
				var $back = $("<li />").append($backButtonWrapper.clone().append($title));
				$(elm).find("> .navigation-root").prepend($back);
			});

			// append toggle button on main header
			this.$holder.find(".header-main > .component-content > .content")
				.append(this.$navButton);

			// replace duplicated ids with new ids
			generateNewIds(this.$navViewport);

			// append handler on snippet wrapper
			this.$holder.find("> .inner > .component-content")
				.append(this.$navViewport);
		},

		removeScroll: function($elm) {
			var height = $elm.offset().top + $elm.outerHeight();
			this.$mainWrapper.css("overflow", "hidden");
			this.$mainWrapper.css("height", Math.max(height, window.innerHeight));
		},

		resetScroll: function() {
			this.$mainWrapper.css("overflow", "");
			this.$mainWrapper.css("height", "");
			this.$navHolder.css("min-height", "");
		},

		refreshScroll: function($elm) {
			this.$currLevel = $elm;
			if (this.$navWrapper.hasClass("is-active")) {
				this.resetScroll();
				window.scrollTo(0, 0);

				_.defer(function() {
					this.removeScroll($elm);
				}.bind(this));
			}
		},

		openNav: function() {
			this.$navWrapper.addClass("is-active");
			this.refreshScroll(this.$supplementary);
			isMobileNavOpen = true;
			Cog.fireEvent("navigation", "mobileOpen");
		},

		closeNav: function() {
			this.$navWrapper.find(".navigation-item.has-children").removeClass("is-active");
			this.$navWrapper.removeClass("is-active");
			this.$navWrapper.removeClass("level-2");
			this.$navWrapper.removeClass("level-3");
			this.$navWrapper.find(".is-enabled").removeClass("is-enabled");
			isMobileNavOpen = false;
			Cog.fireEvent("navigation", "mobileClose");
			_.defer(function() {
				this.resetScroll();
			}.bind(this));
		},

		isStandaloneLink: function($holder) {
			var $childLinks = $holder.find(".navigation-item > a");
			if ($childLinks.length === 1) {
				document.location.href = $childLinks.attr("href");
				return false;
			}
			return true;
		},

		openLevel2: function(e) {
			var elm = e.currentTarget;
			var $tabContent = this.$navWrapper.find(elm.getAttribute("data-tab-id") || elm.hash);
			if (!this.isStandaloneLink($tabContent)) {
				return false;
			}
			this.$currLevel2 = $tabContent;
			this.$navWrapper.addClass("level-2");
			this.$navWrapper.find(".tabs-content").removeClass("is-enabled");
			this.$currLevel2.addClass("is-enabled");
			this.refreshScroll(this.$currLevel2);
			this.$currLevel = this.$currLevel2;
		},

		openLevel3: function(e) {
			this.$navWrapper.addClass("level-3");
			this.$currLevel3 = $(e.currentTarget).parent().addClass("is-active");
			this.refreshScroll(this.$currLevel3);
		},

		backLevel3: function() {
			this.$navWrapper.find(".navigation-item.has-children").removeClass("is-active");
			this.$navWrapper.removeClass("level-3");
			this.refreshScroll(this.$currLevel2);
		},

		backLevel2: function() {
			this.$navWrapper.find(".navigation-item.has-children").removeClass("is-active");
			this.$currLevel2.removeClass("is-enabled");
			this.$navWrapper.removeClass("level-2");
			this.$navWrapper.removeClass("level-3");
			this.refreshScroll(this.$supplementary);
		},

		bindEvents: function() {
			this.$navWrapper.find(".tabs-nav-item > a")
				.on("click", compose(this.openLevel2, preventDefault));

			this.$navWrapper.find(".navigation-item.has-children > .navigation-item-title")
				.on("click", compose(this.openLevel3, preventDefault));

			this.$navWrapper.find(".navigation-root .back-button")
				.on("click", compose(this.backLevel3, preventDefault));

			this.$navWrapper.find(".tabContent > .back-button-wrapper > .back-button")
				.on("click", compose(this.backLevel2, preventDefault));

			this.$navButton.on("click", this.openNav);
			this.$navButtonClose.on("click", this.closeNav);

			$(window).on("resize", $.debounce(300, this.fn(function() {
				this.refreshScroll(this.$currLevel);
			})));
		}
	};

	function DesktopNav($holder) {
		this.$holder = $holder;
		this.$items = $holder.find(".tabs-nav-item");
		this.items = [];

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);

		this.initItems();
	}

	DesktopNav.prototype = {
		initItems: function() {
			this.$items.each(this.fn(function(i, elm) {
				var $elm = $(elm);
				var $link = $elm.find("> a").first();
				var hash = $link[0].hash;
				var $content = $(hash);
				var href = $content.find(".navigation-item > a").first().attr("href");

				$link.attr("data-tab-id", hash);
				if (href) {
					$link.attr("href", href);
				}
				this.items.push(new DesktopNavItem($elm, $content));
			}));
		}
	};

	function DesktopNavItem($holder, $content) {
		this.$holder = $holder;
		this.$content = $content;
		this.state = "idle";
		this.$childLinks = this.$content.find(".navigation-item > a");
		this.isStandaloneLink = this.$childLinks.length === 1;
		this.isActive = this.$content.find(".navigation-item").hasClass("is-active");

		// will bind all methods and create this.fn wrapper for anonymous functions
		bindAll(this);

		this.checkActive();
		this.bindEvents();
	}

	DesktopNavItem.prototype = {
		on: function() {
			if (this.state === "idle") {
				return;
			}

			this.off();
			this.$holder.addClass("is-enabled");
			if (!this.isStandaloneLink) {
				this.$content.addClass("is-enabled");
			}
		},

		off: function() {
			if (this.state === "open") {
				return;
			}

			this.$content.removeClass("is-enabled");
			if (!this.isActive) {
				this.$holder.removeClass("is-enabled");
			}
		},

		go: function() {
			if (this.isStandaloneLink) {
				document.location.href = this.$childLinks.attr("href");
			}
		},

		checkActive: function() {
			if (this.isActive) {
				this.$holder.addClass("is-enabled");
			}
		},

		setState: function(state) {
			this.state = state;
		},

		bindEvents: function() {
			// Debounce the shown / hide to the user

			// value just to avoid unecessary trigger when passing
			// mouse over without the intention to hover item
			var delayOn = $.debounce(80, this.on);
			// value just to avoid blinking effect of the background
			var delayOff = $.debounce(400, this.off);

			this.$holder.on("click", compose(this.go, preventDefault));
			this.$holder.add(this.$content)
				.on("mouseenter", compose(delayOn, this.fn(this.setState, "open")))
				.on("mouseleave", compose(delayOff, this.fn(this.setState, "idle")));
		}
	};

	SkipToContent.prototype = {

		focus: function() {
			this.$content.attr("tabindex", 0).one("blur focusout", function() {
				this.$content.removeAttr("tabindex");
			}.bind(this));
			this.$content.get(0).focus();
		},

		bindDOM: function($link) {
			this.$link = $link;
			this.$content = $("#content");
		},

		bindEvents: function() {
			this.$link.on("click", this.focus.bind(this));
		}
	};

	function SkipToContent($link) {
		this.bindDOM($link);
		this.bindEvents();
	}

	function StickyHeader($header) {
		this.bindDOM($header);
		this.measureHeaderHeight();
		this.bindEvents();
		this.onScroll();
	}

	StickyHeader.prototype = {

		isSticky: false,

		stick: function() {
			this.isSticky = true;
			this.$header.addClass("is-sticky")
				.css("height", this.headerHeight);
			this.$body.addClass("has-sticky-header");
		},

		unstick: function() {
			this.isSticky = false;
			this.$header.removeClass("is-sticky")
				.css("height", "auto");
			this.$body.removeClass("has-sticky-header");
		},

		onScroll: function() {
			if (isMobileNavOpen) {
				return false;
			}

			if (!this.isSticky && window.pageYOffset >= 0) {
				this.stick();
			} else if (this.isSticky && window.pageYOffset <= 0) {
				this.unstick();
			}
		},

		onMobileOpen: function() {
			this.unstick();
		},

		onResize: function() {
			this.measureHeaderHeight();
		},

		measureHeaderHeight: function() {
			this.headerHeight = this.$header.height();
		},

		bindEvents: function() {
			this.$window.on("scroll", _.throttle(this.onScroll.bind(this), 100));
			this.$window.on("resize", _.debounce(this.onResize.bind(this), 300));
			Cog.addListener("navigation", "mobileOpen", this.onMobileOpen.bind(this));
			Cog.addListener("navigation", "mobileClose", this.onScroll.bind(this));
		},

		bindDOM: function($header) {
			this.$header = $header;
			this.$supplementaryHeader = this.$header.find(".header-supplementary").first();
			this.$window = $(window);
			this.$body = $("body");
		}
	};

	var bindAll, compose;
	var api = {
		onRegister: function(scope) {
			bindAll = bindAll || this.external.bindAll;
			compose = compose || this.external.compose;
			var $el = scope.$scope;

			new LanguageSelector($el.find(".box-language-selector .navigation-root.navigation-level1, .box-language-selector .countrylanguageselector__root"));
			new MobileNav($el);
			new DesktopNav($el.find(".header-main .tabs-main-navigation"));
			new SkipToContent($el.find(".richText-skip-to-content a"));
			new StickyHeader($el);
		}
	};

	Cog.registerComponent({
		name: "header",
		api: api,
		selector: "[class*=reference-header]",
		requires: [{
			name: "utils.bindAll",
			apiId: "bindAll"
		},{
			name: "utils.compose",
			apiId: "compose"
		}]
	});

	return api;
}(Cog.jQuery()));
