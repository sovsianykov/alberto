(function($) {
	"use strict";

	// Make year in footer auto updatable
	var copyrightNode = $(".copyright-year-js .richText-content p:first-child");
	copyrightNode.text(copyrightNode.text().replace(/\d{4}/, new Date().getFullYear()));

}(Cog.jQuery()));
