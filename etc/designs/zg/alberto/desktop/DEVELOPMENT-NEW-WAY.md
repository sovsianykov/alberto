# Developing Components Without Configuration

The old way of styling components heavily relied on configuration files (SCSS maps). This is not the case for the new/refactored ones.   
The aim of the refactoring is to simplify and reduce the size of the output CSS, align the CSS closer to the Unilever Standards and to enable agencies who don't have expert SASS developers to easily customise their themes.

_**Note**: These are instructions for refactored components that do not use configuration files.
To know more about configuration files check [old dev guide](DEVELOPMENT.md) and [types reference](SASS-TYPES.md)._

## File structure
Check the [example component](sass/components/aaa-example/index.scss) for reference.

## Responsiveness
Don't use breakpoints mixin, it's been deprecated. Use `media-query($from, $to: $from)`.
Remember to write all properties mobile-first and use media-query for wider devices.
 
Example usage:
```scss
.div {
  margin: 0;

  @include media-query(tablet, wide) {
    margin: 20px spacings('s');
  }
}
```

Possible arguments include:
- small,
- mobile,
- tablet,
- notebook,
- desktop,
- wide

Note when the upper limit is not specified the query is targeting the specific size only (e.g. only desktop).

## Upgrading existing themes 
When provided with refactored SCSS for a component the component can be easily upgraded.
Most old-way config properties translate one-to-one to regular SCSS ones so they can be reapplied to new SCSS in a straightforward manner.
For example:

```scss
//configuration
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

//old way
.example {
  @include box(g('scope1.scope2.box'), $media);
}

//new way (without configuration)
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
//configuration
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

//old way
.example {
  @include box(g('scope1.scope2.box'), $media);
}

//new way (without configuration)
.example {
  margin: 0 -20px;
  
  @include media-query(desktop, wide) {
      margin: 0 spacings('s');
    }
}
```

### Which properties should be provided
When upgrading SCSS to the refactored one there is no configuration file.
All default properties are included in the new way. Only theme-specific properties need to be upgraded like in the above examples.
Easiest way is to look at the history of the old configuration file and reapply non-default properties. 
