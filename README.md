# animatedModal.js

animatedModal.js is a jQuery plugin to create a fullscreen modal with CSS3 transitions. You can use transitions from animate.css or create your own transitions.

## Installation

```bash
npm install animatedModal
```

You also need jQuery and (optionally) animate.css for the default animation class names.

## Import & usage examples

### UMD (script tags)

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" />
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="/path/to/animatedModal.js"></script>

<a id="open-demo" href="#demo-modal">Open</a>

<div id="demo-modal">
  <button data-modal-close>Close</button>
  <p>Modal content</p>
</div>

<script>
  $("#open-demo").animatedModal();
</script>
```

### ESM (bundlers)

```js
import $ from "jquery";
import "animatedModal";
import "animate.css";

$("#open-demo").animatedModal();
```

### CJS (bundlers)

```js
const $ = require("jquery");
require("animatedModal");
require("animate.css");

$("#open-demo").animatedModal();
```

> **Note:** The package exposes a browser-ready plugin (UMD-style IIFE) and expects a global jQuery instance. ESM/CJS examples above are intended for bundlers that shim globals and treat the plugin as a side-effect import.

## Zero-config example (data attributes)

This uses all defaults and only relies on the `data-modal-close` attribute to bind the close button.

```html
<a id="open-minimal" href="#minimal-modal">Open modal</a>

<div id="minimal-modal">
  <button data-modal-close>Close</button>
  <p>Minimal modal content.</p>
</div>

<script>
  $("#open-minimal").animatedModal();
</script>
```

## CSS variables (optional) + customization examples

animatedModal.js does not require CSS variables, but you can define your own custom properties to keep modal styling consistent. The following list is a **recommended** set you can adopt in your own CSS:

```css
:root {
  --animated-modal-bg: rgba(0, 0, 0, 0.85);
  --animated-modal-color: #fff;
  --animated-modal-padding: 2rem;
  --animated-modal-max-width: 960px;
  --animated-modal-border-radius: 16px;
}
```

### Example: applying the variables to your modal

```css
#demo-modal {
  background: var(--animated-modal-bg);
  color: var(--animated-modal-color);
  padding: var(--animated-modal-padding);
  max-width: var(--animated-modal-max-width);
  margin: 0 auto;
  border-radius: var(--animated-modal-border-radius);
}
```

### Example: overriding variables per modal

```css
#minimal-modal {
  --animated-modal-bg: #111827;
  --animated-modal-padding: 1.5rem;
}
```

## Options (TypeScript-friendly)

While the plugin is a jQuery extension, the options are straightforward to model in TypeScript. You can use an interface like this in your own code:

```ts
export interface AnimatedModalOptions {
  modalTarget?: string;
  position?: string;
  width?: string;
  height?: string;
  top?: string;
  left?: string;
  zIndexIn?: string;
  zIndexOut?: string;
  opacityIn?: string;
  opacityOut?: string;
  animatedIn?: string;
  animatedOut?: string;
  animationDuration?: string | number;
  beforeOpen?: () => void;
  afterOpen?: () => void;
  beforeClose?: () => void;
  afterClose?: () => void;
}
```

### Migration guide: jQuery options → TS options

The new TypeScript options map 1:1 to the legacy jQuery option names.

| Legacy jQuery option | TypeScript option | Type |
| --- | --- | --- |
| `modalTarget` | `modalTarget` | `string` |
| `position` | `position` | `string` |
| `width` | `width` | `string` |
| `height` | `height` | `string` |
| `top` | `top` | `string` |
| `left` | `left` | `string` |
| `zIndexIn` | `zIndexIn` | `string` |
| `zIndexOut` | `zIndexOut` | `string` |
| `opacityIn` | `opacityIn` | `string` |
| `opacityOut` | `opacityOut` | `string` |
| `animatedIn` | `animatedIn` | `string` |
| `animatedOut` | `animatedOut` | `string` |
| `animationDuration` | `animationDuration` | `string | number` |
| `beforeOpen` | `beforeOpen` | `() => void` |
| `afterOpen` | `afterOpen` | `() => void` |
| `beforeClose` | `beforeClose` | `() => void` |
| `afterClose` | `afterClose` | `() => void` |

## Documentation and demos

[Documentation and demos](https://joaopereirawd.github.io/animatedModal.js/)
