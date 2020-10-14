# North American Starter Kit

This folder contains front-end code for the Starter Kit

## Getting started

Navigate to desktop directory and run: `npm install`

Then run: `gulp server`

You can then open the project: `http://localhost:8000/content/blueprints/author/north-america/us/en/home.html`
> Note that it is recommended to use `NPM 5.4`.

## Contributing

If you are contributing to these check `#unilever-ui` chat on *Slack*

## Organization

Sass folders are organized as:

### ~/sass

* **/commons**: all common configs
* **/components**: all components
* **/composites**: all composites and snippets
* **/core**: output css and global configurations
* **/raw**: all `raw` styles from platform, usually it's deleted after customization
* **/vendor**: any third-party css
* **/structure**: all global rules that don't apply on components or composites
* **/utils**: all sass mixins and functions, also where `author.scss` needs to be

For new components that don't use configuration:

### ~/sass/components/[name]

* **index.scss**: styles for the component

For old components that do use configuration:

### ~/sass/components/[name]

* **_index.scss**: entry point of the component, also has the base style.
* **_config.scss**: configuration file for specific component and its variations.
* 
* **/[variant-name]/_index.scss**: each component variation has its own file.
* **_[helper-name].scss: pieces of CSS fragments to ease maintenance and keep files smaller. Variants can have helpers as well.
* **_config-[helpername].scss: configuration file for specific helper.

`_index.scss` should import config and variation files inside component scope. Example considering "accordion" component:

```
.accordion {
  @import 'config'; // this is main config
  @import 'main-heading'; // this is a helper that will import its own config inside it following this same format

  [default rules]
}

@import 'vertical/index'; // this is a variant
```

Note that the **~/sass/composites** follows the same logic.

## Customizing components

Component configurations are defined in 3 layers:

* **global** configurations defined at `~/sass/core/_config.scss`;
* **component** configurations defined at `~/sass/{components,composites}/[component-name]/_config.scss`;
* **component variation** configurations defined at `~/sass/{components,composites}/[component-name]/_config-[variation-name].scss`;

All global configurations are in a map called `$common` with anything that can be used by other components, eg.: `colors`, `spacings`, `font-sizes`, `font-family`, etc.

Note that new/refactored components don't use configuration.

### Common stuff

All common configuration stays inside `~/sass/commons` and should just add themselves to `$common` variable. Example of a common file:

```
$common: () !default; // always do this to avoid errors with null $common variable.

$common: merge($common, ( // always merge existing common with new configurations
  _base: (
    button: (...) // base button config comes here
  )
));

$common: merge($common, (
  _primary: (
    button: extend('_base.button', (...)) // primary button config comes here
  )
));
```

## How variables work

All variables are defined inside maps to have the flexibility with extensions. There are some useful functions that will help calling and using maps.

### get($list, $args...)

Receives the map as the first parameter and following parameters as the "path" to the desired property. Eg.:

```
$test: (
  parent: (
    child: "value"
  )
);

// Examples:

$var: "child";
get($test, "parent.child")  // "value"
get($test, parent, $var)    // "value"
get($test, parent)          // ( child: "value" )
get($test, I, "dont.exist")  // null
```

Inside the scope of the component, it's useful to create a local function called `g` that will serve as a shortcut. Eg.:

```
.my-component {
  @function g($a...) { @return get-last($modules, "hero", $a...); }

  background-color: g("background-color");
}
```

### get-last($list, $args...)

Same thing as `get` but will stop on the last moment where there was a value. Useful for global vs specific data. Eg.:

```
$test: (
  font-size: (mobile: 16px, desktop: 20px)
)
$test-global: (
  font-size: 12px
)

get-last($test, 'font-size.mobile'); // 16px;
get-last($test-global, 'font-size.mobile'); // 12px;
```

### common($args...)

This command is a shortcut for `get($common, $args...)`.

### merge($data, $merge: ())

Makes a deep merge on the received data, useful for extending default values. Eg.:

```
$base-button: (
  background-color: #fff,
  font-size: 13px,
  color: #000,
  padding: 5px 8px
);

merge($base-button, ( padding: 10px 16px )); // ( background-color: #fff, font-size: 13px, color: #000, padding: 10px 16px )
```

### extend($common, $map)

A shortcut for `merge(common($common), $map)`;

### px($val)

Is sort of a shortcut of `common('font-size', $val)` but it will be multiplied by `common('font-ratio')` to easy the process of changing a font with a different visual body. `$val` can be a hard-coded value for exeptions of the label of global font-sizes (`s`, `m`, `l`, `xl`, etc).

### breakpoint($args...)

Deprecated. Use media-query mixin instead.

Breakpoint data are defined per property and follows the `(mobile: null, tablet: null, desktop: null)` logic. `breakpoint` function will help the creation of this map. Eg.:

```
// - breakpoint(18px, 16px) // (mobile: 18px, tablet: 16px)
// - breakpoint(18px, null, 16px) // (mobile: 18px, desktop: 16px)
// - breakpoint((tablet-max: 18px)) // (mobile: 18px, tablet: 18px)
// - breakpoint((mobile: 18px, tablet-min: 16px)) // (mobile: 18px, tablet: 16px, desktop: 16px)
```

### Other functions

The functions listed above are useful for customization. If you are developing the blueprint, take a look at [DEVELOPMENT.md](DEVELOPMENT.md) file with more details regarding mixins, functions and how to edit sass files.
For new components look at [DEVELOPMENT-NEW-WAY.md](DEVELOPMENT-NEW-WAY.md).

## How colors work

An explanation with examples can be seen at [https://codepen.io/mcarneiro/pen/qXYeME](https://codepen.io/mcarneiro/pen/qXYeME).

Colors are defined at `common('colors')` and have 4 variations: `darker`, `dark`, `light`, `lighter` that can be called using `color` function. Eg.:

```
$common: merge($common, (
  colors: (
    primary: #ab1f72,
    neutral: (
      dark: #413f47,
      base: #50585e
    )
  )
);

color('primary'); // returns "base" #ab1f72
color('primary', 'dark'); // returns automatically generated #801756
color('neutral', 'dark'); // returns manually defined #801756
```

## How icons work

This project uses icon font that are generated using [IcoMoon](https://icomoon.io/app).
Place files generated from IcoMoon under assets/fonts/.
List of icons with corresponding codes should be placed in core/_config.scss 

## How fonts work

lh-margin-diff and lh-padding mixins are used to center text vertically. Top and bottom diff on the fonts are defined in core/_config.scss for each font-family.

## Regression Tests

To make quick tests for refactory or to check if your change is not impacting other components we are using backstopjs with this small project that'll generate the config file based on the sitemap: https://github.com/mcarneiro/backstop-sitemap

`config.js` example for this project:

```
module.exports = {
  linkSelector: '.sitemap a, .image-brand-logo a',
  url: 'http://aem-author-url.com',
  loginUri: '/libs/granite/core/content/login.html/j_security_check',
  loginPostData: {
   _charset_: 'utf-8',
   j_username: 'admin',
   j_password: 'password',
   j_validate: 'true'
  },
  sitemapUri: '/content/brands/bws-migration/us/en/home/sitemap.html?wcmmode=disabled'
}
```
