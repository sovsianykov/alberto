# Refactoring SCSS components

This is a guide on how to carry on with refactoring SCSS components.

## Create a page

Create a page containing the element to be refactored (including all variants). Export it via Style Wizard to be able to use it with the front-end dev server.
More details can be found in the "Getting Started" section in the [README](README.md) and in the Front-End Development Guide.

## Set up automated testing

Set up a tool for automated testing, e.g. [BackstopJS](https://github.com/garris/BackstopJS).

```bash
npm install -g backstopjs
cd any/folder
backstop init
```

Edit the `backstop.json` configuration file. Example content might look like this:
```json5
{
  "viewports": [
    {
      "label": "mobile",
      "width": 420,
      "height": 480
    },
    {
      "label": "tablet",
      "width": 768,
      "height": 768
    },
    {
      "label": "notebook",
      "width": 979,
      "height": 768
    },
    {
      "label": "desktop",
      "width": 1139,
      "height": 768
    }
  ],
  "onBeforeScript": "chromy/onBefore.js",
  "onReadyScript": "chromy/onReady.js",
  "scenarios": [
    {
      "label": "Some label",
      "url": "http://localhost:8000/content/brands/platform-demo/us/en/home.html", //or other path
      "readySelector": ".some-css-selectors",
      "hoverSelector": ".some-css-selectors",
      "selectorExpansion": true,
      "misMatchThreshold" : 0.3,
      "requireSameDimensions": true,
      "delay": 2500,
      "postInteractionWait": 1000
    }
  ],
  "paths": { //if not specified backstop uses install directory
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "engine_scripts": "backstop_data/engine_scripts",
    "html_report": "backstop_data/html_report",
    "ci_report": "backstop_data/ci_report"
  },
  "report": ["browser"],
  "engine": "chromy",
  "asyncCaptureLimit": 1,
  "asyncCompareLimit": 1,
  "debug": false,
  "debugWindow": false
}
```

Use the following command to create the reference screenshots:

```bash
backstop reference
```

After editing the SCSS use the following command to compare the view with reference screenshots:

```bash
backstop test
```

More info on [Backstop JS Github](https://github.com/garris/BackstopJS).

## Refactor SCSS for the component

Currently components use `index.scss` and `_config.scss` files. They need to be combined into a single file, that do not use configuration-consuming mixins.

Most old-way config properties translate one-to-one to regular SCSS ones so they can be reapplied to new SCSS in a straightforward manner.
For example:

```scss
//old _config.scss
$example: (
  scope1: (
    scope2: (
      box: (
        margin: (
          margin: 0 -20px
        )
      )
    )
  )
);

//old index.scss
.example {
  @include box(g('scope1.scope2.box'), $media);
}

//new index.scss
.example {
  margin: 0 -20px;
}
```

Remember that some config properties are conditional or result in more then one SCSS property. In case of any doubt generated CSS files can serve as a reference.

### Upgrading breakpoints mixin
If an existing theme makes use of a custom breakpoint mixin it needs to add an analogous media-query mixin.
Properties outside the media-query mixin should be the default/mobile ones.
For example:

```scss
//old _configuration.scss
$example: (
  scope1: (
    scope2: (
      box: (
        margin: (
          margin: breakpoint((tablet-max: 0 -20px, desktop: 0 get($example, 'spacings.s')))
        )
      )
    )
  )
);

//old index.scss
.example {
  @include box(g('scope1.scope2.box'), $media);
}

//new index.scss
.example {
  margin: 0 -20px;
  
  @include media-query(desktop, wide) {
      margin: 0 spacings('s');
    }
}
```

See [example component](sass/components/aaa-example/index.scss) for reference.
