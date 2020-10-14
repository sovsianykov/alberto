# Developing Blueprint

How to create components and guarantee that configuration changes will reflect on css properties.

_**Note**: These instructions are out of date for refactored components (ones without configuration scss file).
For more information check [those instructions](DEVELOPMENT-NEW-WAY.md)._

## Contracts

All map inside a configuration is a kind of "contract" that will be used by mixins to write the code. Eg.: a valid map for "text" can have until:

```
$common:(
  _my-text: (
    text: (
      text-transform: none,
      font-style: normal,
      text-align: left,
      color: color('neutral', 'dark'),
      font-family: 'primary',
      font-size: px('s'),
      font-weight: normal,
      line-height: 1.5
    )
  )
)
```

> Note that everything that's not a "contract" should have the `_` prefix to be clear for other developers that it's a "label" or custom/exception config.

To implement it inside the component css, use the attribute mixins. In this case, `text` mixin will make everything that's needed for implementing this "contract":

```
.my-paragraph {
  @include text(get($common, '_my-text.text'), 'desktop')
}
```

Note that the second parameter was the breakpoint. Currently there are 3 breakpoints used in configuration: `mobile`, `tablet` and `desktop` that follows designs definitions and this value is used as the second parameter of all attribute mixins.

-----

When we have different values for specific breakpoints, we need to use `breakpoint` function so correct map is created, eg.:

```
(
  ...
  font-size: breakpoint(px('m'), px('s'), px('s')),
  ...
)
```

To ease the implementation of different values in different mediaqueries, there's the `breakpoints` mixin that'll update `$media` global variable to be used inside attribute mixins. So, the last `text` implementation will look like:

```
.my-paragraph {
  @include breakpoints {
    @include text(get($common, 'my-text'), $media);
  }
}
```

> **Important** `breakpoints` mixin uses another mixin called `media-query` as it's focused on configuration breakpoints. This mixin is used just for core creative configuration specific for different screen sizes. For layout, uses `media-query` mixin docummented below.

You can find attribute mixins inside `~/sass/utils/_attr.scss` with the list of property used for each one. Currently there are: `background`, `border`, `button`, `input`, `text` and `icon` (with specific file `_icon.scss` for it).

All of them uses `attr` mixin that works as:

```
@include attr(get($common, 'my-text'), ('font-size'), 'mobile'); // will print font-size property if map has "font-size.mobile".
```

## media-query($from, $to: $from)

`media-query` is a more flexible mixin and allow you to use max/min-width freely. Also, there are other breakpoints that can be used as `mobile`, `tablet`, `notebook`, `desktop`, `wide`.

So if there's any layout need where you need to make something "until notebook", just do:

```
.my-component {
  @include media-query(auto, notebook) {
    // will print @media screen and (max-width:[notebook-max value]) { ... }
    ...
  }
}
```

Something only for "mobile":

```
.my-component {
  @include media-query(mobile) {
    // will print @media screen and (max-width:[mobile-max value]) { ... }
    ...
  }
}
```

Something only **from** "notebook":

```
.my-component {
  @include media-query(notebook, auto) {
    // will print @media screen and (min-width:[notebook-min value]) { ... }
    ...
  }
}
```

Something only **for** "notebook":

```
.my-component {
  @include media-query(notebook) {
    // will print @media screen and (min-width:[notebook-min value]) and (max-width:[notebook-max value]) { ... }
    ...
  }
}
```

## safetype($d, $default)

Function. If $d is not the same type as $default, returns $default.

## trbl($val)

Function. Receives a value or list and will return following the "top right bottom left" logic.
