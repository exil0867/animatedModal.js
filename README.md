# animatedModal

animatedModal is a modern TypeScript library for fullscreen modals. It ships with a ready-to-use CSS file, supports animation classes, and keeps integration simple so you can drop it into existing projects with minimal changes.

## Install

```bash
pnpm add animatedmodal
```

## Quick start

```html
<link rel="stylesheet" href="/node_modules/animatedmodal/dist/animated-modal.css" />
```

```ts
import { createAnimatedModal } from 'animatedmodal';
import 'animatedmodal/style.css';

const trigger = document.querySelector('#open-modal');
if (trigger instanceof HTMLElement) {
  createAnimatedModal(trigger, {
    modalTarget: 'demo-modal',
  });
}
```

```html
<a id="open-modal" href="#demo-modal">Open modal</a>

<div id="demo-modal">
  <button data-modal-close>Close</button>
  <h2>Modal content</h2>
</div>
```

> Using a bundler? You can import the CSS directly with `import 'animatedmodal/style.css';` or copy the file from `dist/animated-modal.css` into your own build pipeline.

## Usage with script tags

```html
<link rel="stylesheet" href="animated-modal.css" />
<script type="module">
  import { createAnimatedModal } from './animatedmodal.js';

  const trigger = document.querySelector('#open-modal');
  if (trigger instanceof HTMLElement) {
    createAnimatedModal(trigger);
  }
</script>
```

## Options

All options are optional and can be passed to `createAnimatedModal()`.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `modalTarget` | `string` | derived from `href` | Target modal id (without `#`). |
| `position` | `string` | `fixed` | Positioning for the modal container. |
| `width` | `string` | `100%` | Modal width. |
| `height` | `string` | `100%` | Modal height. |
| `top` | `string` | `0px` | Top position. |
| `left` | `string` | `0px` | Left position. |
| `zIndexIn` | `string` | `9999` | Z-index when open. |
| `zIndexOut` | `string` | `-9999` | Z-index when closed. |
| `opacityIn` | `string` | `1` | Opacity when open. |
| `opacityOut` | `string` | `0` | Opacity when closed. |
| `animatedIn` | `string` | `fadeIn` | Animation class name for opening. |
| `animatedOut` | `string` | `fadeOut` | Animation class name for closing. |
| `animationDuration` | `string \| number` | `0.2s` | Animation duration. |
| `closeTrigger` | `string` | `[data-modal-close]` | Selector for the close button(s). |
| `beforeOpen` | `() => void` | `undefined` | Callback before opening. |
| `afterOpen` | `() => void` | `undefined` | Callback after opening. |
| `beforeClose` | `() => void` | `undefined` | Callback before closing. |
| `afterClose` | `() => void` | `undefined` | Callback after closing. |

## Customization

animatedModal ships with a CSS file that you can import and override. Start by changing CSS variables:

```css
:root {
  --animated-modal-background: #0f172a;
  --animated-modal-color: #f8fafc;
  --animated-modal-duration: 300ms;
  --animated-modal-padding: 2.5rem;
}
```

Want custom animations? Provide your own classes and update the options:

```css
.modal-slide-in {
  animation-name: slideIn;
}

.modal-slide-out {
  animation-name: slideOut;
}
```

```ts
createAnimatedModal(document.querySelector('#open-modal') as HTMLElement, {
  animatedIn: 'modal-slide-in',
  animatedOut: 'modal-slide-out',
  animationDuration: '0.35s',
});
```

## Build & test

```bash
pnpm run build
pnpm test
```

## License

MIT
