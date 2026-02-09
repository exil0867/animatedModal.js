# animatedModal.js
<p>animatedModal.js is a jQuery plugin to create a fullscreen modal with CSS3 transitions. You can use the transitions from animate.css or create your own transitions.</p>
<a href="https://joaopereirawd.github.io/animatedModal.js/">Documentation and demos</a>

## CSS variables

The default stylesheet is available at `css/animatedModal.css` and is driven by CSS variables so you can override styles per instance (inline styles or a custom class). The base styles expect the modal container to use the `.animated-modal` class and the modal contents to live inside `.animated-modal__content`.

### Defaults

```css
:root {
  --am-duration: 0.2s;
  --am-easing: ease;
  --am-background: #000;
  --am-overlay-opacity: 0.8;
  --am-z-index: 9999;
  --am-z-index-hidden: -9999;
}
```

### Per-instance overrides

```html
<div
  id="demo-modal"
  class="animated-modal am-open am-animating demo-modal"
  style="--am-duration: 0.4s; --am-background: #222; --am-overlay-opacity: 0.9;"
>
  <div class="animated-modal__content">
    Modal content
  </div>
</div>
```

### State classes

Use the following classes to control visibility and focusability:

- `.am-open` shows the modal (opacity, visibility, pointer-events, z-index).
- `.am-animating` keeps transition settings applied during open/close sequences.

The stylesheet also includes a `prefers-reduced-motion: reduce` fallback to disable transitions for motion-sensitive users.
