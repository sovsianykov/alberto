# Sass Types Reference

"Types" defines what can be customizable in the config file. There are "base" types, used on "extensions".

Note that all properties accept `breakpoint` mixin, eg.: `(text: (font-size: breakpoint(16px, 16px, 12px)))` with exception of shorthands.

Most property names and values follows CSS convention. On the list below the exceptions will be noted under the example code.

_**Note**: These instructions are out of date for refactored components (ones without configuration scss file).
For more information check [those instructions](DEVELOPMENT-NEW-WAY.md)._

-----

## Base types

### "text"

```
(
  text: (
    color: color('primary'),
    font-size: px('xs'),
    font-weight: bold,
    font-family: font-family('primary'),
    line-height: 1.3,
    text-transform: none,
    text-align: center,
    text-shadow: 2px 2px #000,
    font-style: normal,
    letter-spacing: 1px,
    text-decoration: none,
    white-space: initial
  )
)
```

Naming doesn't follow CSS attribute convention for:

`font-family`: should receive `common.font-family.[value]` map by using `font-family()` function.

Shorthand will fall to `color`:

```
(
  text: color('base')
)
```

### "background"

```
(
  background: (
    background: url(...) no-repeat,
    background-color: color('white'),
    background-image: url(...),
    background-repeat: repeat-x,
    background-size: cover,
    background-position: center center
  )
)
```

Shorthand will fall to `background`:

```
(
  background: url('...') no-repeat
)
```

### "border"

```
(
  border: (
    border: 1px solid color('primary'),
    border-top: 2px solid color('primary'),
    border-left: 2px solid color('primary'),
    border-right: 2px solid color('primary'),
    border-bottom: 2px solid color('primary'),
    border-width: 10px,
    border-style: solid,
    border-color: color('secondary'),
    border-radius: 5px,
    border-top-left-radius: 2px,
    border-top-right-radius: 2px,
    border-bottom-left-radius: 2px,
    border-bottom-right-radius: 2px
  )
)
```

Shorthand will fall to `border`:

```
(
  border: 1px solid color('primary')
)
```

### "padding"

```
(
  padding: (
    padding: 10px 5px,
    padding-top: 2px,
    padding-right: 2px,
    padding-bottom: 2px,
    padding-left: 2px
  )
)
```

Shorthand will fall to `padding`:

```
(
  padding: 5px 2px
)
```

### "margin"

```
(
  margin: (
    margin: 10px 5px,
    margin-top: 2px,
    margin-right: 2px,
    margin-bottom: 2px,
    margin-left: 2px
  )
)
```

Shorthand will fall to `margin`:

```
(
  margin: 10px 5px 2px
)
```

### "flex"

```
(
  flex: (
    'flex': 1 0 0,
    'align-content': flex-start,
    'align-items': center,
    'align-self': flex-start,
    'flex-basis': auto,
    'flex-direction': row,
    'flex-flow': row nowrap,
    'flex-grow': 1,
    'flex-shrink': 1,
    'flex-wrap': wrap,
    'justify-content': space-between,
    'order': 1
  )
)
```

Shorthand will fall to `flex`:

```
(
  flex: 1 0 0
)
```

### "size"

```
(
  width: 100px,
  height: 100px,
  min-width: 100px,
  min-height: 100px,
  max-width: 100px,
  max-height: 100px
)
```

No shorthand for this properties (they are usually used directly on the root of the extension types).

### "transform"

```
(
  transform: (
    transform: scale(1.5, 1.5),
    transform-origin: 0 0,
    transform-style: flat,
    backface-visibility: visible,
    perspective: 20px,
    perspective-origin: 50% 50%
  )
)
```

Shorthand will fall to `transform`:

```
(
  transform: translateX(10px)
)
```

### "icon"

```
(
  icon: (
    content: common('icon.arrow-down'),
    font-size: px(18px),
    color: color('primary'),
    side: after,
    spacing: 5px,
    display: block,
    opacity: 1,
    [box implementation],
    hover: [hover implementation]
  )
)
```

Naming doesn't follow CSS attribute convention for:

* `side`: this defines if icon will be placed on a `before` or `after` pseudo element.
* `spacing`: this will define the spacing between icon and text (will be `margin-left` for `icon-side`=`after` and `margin-right` for `icon.side`=`before`)

Icon doesn't have a shorthand.

### "transition"

Transitions depends on the extension type implementation and will be implemented inside `hover` map.

```
(
  transition: (
    delay: 0s,
    speed: 'slow' || 0.3s,
    ease: ease-out
  )
)
```

Naming doesn't follow CSS attribute convention for:

* `speed` = transition-duration
* `ease` = transition-timing-function

Also, `speed` can receive a label that is defined on `common.transitions.speed.[value]`.

-----

## Extension types

### "line"

```
(
  line: (
    [size implementation],
    border: ([text implementation]),
    margin: ([margin implementation]),
    transform: ([line implementation]),
    side: after,
    display: inline-block,
    vertical-align: baseline,
    hover: ([hover implementation])
  )
)
```

### "paragraph"

```
(
  paragraph: (
    text: ([text implementation]),
    margin: ([margin implementation]),
    line: ([line implementation]),
    display: block
  )
)
```

### "hover"

```
(
  hover: (
    background: ([background implementation]),
    text: ([text implementation]),
    border: ([border implementation]),
    transform: ([transform implementation]),
    opacity: 0.5
  )
)
```

### "box"

```
(
  box: (
    [size implementation],
    background: ([background implementation]),
    border: ([border implementation]),
    margin: ([margin implementation]),
    padding: ([padding implementation]),
    flex: ([flex implementation]),
    display: block,
    box-shadow: 1px 1px 1px #000,
    box-sizing: border-box,
    z-index: 1,
    overflow: visible,
    position: ''
  )
)
```

All boxes are `position: relative` by default, to override it just put an empty string: `position: ''`.

### "link"

```
(
  link: (
    text: ([text implementation]),
    line: ([line implementation]),
    display: breakpoint(none, block, block),
    hover: ([hover implementation])
  )
)
```

Note that when `line` exists, link will be `position: relative` and line will be absolute positioned to the bottom.

### "button"

```
(
  button: (
    [box implementation],
    text: ([text implementation]),
    hover: ([hover implementation]),
    flex: ([flex implementation]),
    icon: ([icon implementation]),
    vertical-align: middle,
    display: inline-flex
  )
)
```

### "input"

```
(
  input: (
    [button implementation],
    placeholder: ([text implementation])
  )
)
```

### "classlist"

This is used to generate class variations on config level.

```
classlist: (
  defaults: (),
  items: (
    class-name-1: (),
    class-name-2: (),
    ...
  )
)
```

Everything in `defaults` will be merged with `class-name-#`. This will generate `.class-name-1` and `.class-name-2`.
