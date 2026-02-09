import type { AnimatedModalInstance, AnimatedModalOptions, ElementOrSelector } from './types';

const DEFAULT_OPTIONS: Omit<Required<AnimatedModalOptions>, 'trigger'> = {
  target: '',
  closeSelector: '[data-modal-close]',
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: '0px',
  left: '0px',
  zIndexIn: '9999',
  zIndexOut: '-9999',
  opacityIn: '1',
  opacityOut: '0',
  animatedIn: 'fadeIn',
  animatedOut: 'fadeOut',
  animationDuration: '.2s',
  beforeOpen: () => undefined,
  afterOpen: () => undefined,
  beforeClose: () => undefined,
  afterClose: () => undefined,
};

let activeInstance: AnimatedModal | null = null;
let instanceCounter = 0;

const resolveElement = (input: ElementOrSelector, label: string): Element => {
  if (typeof input === 'string') {
    const found = document.querySelector(input);
    if (!found) {
      throw new Error(`AnimatedModal: ${label} selector "${input}" did not match any element.`);
    }
    return found;
  }
  return input;
};

const getScrollBarWidth = (): number => {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.overflow = 'scroll';
  document.body.appendChild(outer);
  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);
  const widthWithScroll = inner.getBoundingClientRect().width;
  outer.remove();
  return 100 - widthWithScroll;
};

const getAnimationDurationMs = (duration: string | number | undefined): number => {
  if (!duration) {
    return 0;
  }
  if (typeof duration === 'number') {
    return duration;
  }
  if (duration.includes('ms')) {
    return Number.parseFloat(duration);
  }
  if (duration.includes('s')) {
    return Number.parseFloat(duration) * 1000;
  }
  return Number.parseFloat(duration);
};

const applyAnimationDuration = (target: HTMLElement, duration: string | number): void => {
  const normalized = typeof duration === 'number' ? `${duration}ms` : duration;
  target.style.setProperty('-webkit-animation-duration', normalized);
  target.style.setProperty('-moz-animation-duration', normalized);
  target.style.setProperty('-ms-animation-duration', normalized);
  target.style.animationDuration = normalized;
};

const waitForAnimation = (target: HTMLElement, duration: string | number): Promise<void> =>
  new Promise((resolve) => {
    const durationMs = getAnimationDurationMs(duration);
    let resolved = false;

    const resolveOnce = (): void => {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve();
    };

    const timeoutId = window.setTimeout(resolveOnce, durationMs + 50);
    const handler = (): void => {
      window.clearTimeout(timeoutId);
      target.removeEventListener('animationend', handler);
      target.removeEventListener('webkitAnimationEnd', handler);
      target.removeEventListener('oanimationend', handler);
      target.removeEventListener('MSAnimationEnd', handler);
      resolveOnce();
    };

    target.addEventListener('animationend', handler, { once: true });
    target.addEventListener('webkitAnimationEnd', handler, { once: true });
    target.addEventListener('oanimationend', handler, { once: true });
    target.addEventListener('MSAnimationEnd', handler, { once: true });

    if (durationMs === 0) {
      window.clearTimeout(timeoutId);
      window.setTimeout(resolveOnce, 0);
    }
  });

export class AnimatedModal implements AnimatedModalInstance {
  private readonly options: Required<AnimatedModalOptions>;
  private readonly target: HTMLElement;
  private readonly trigger: Element | null;
  private readonly closeSelector: string;
  private readonly modalName: string;
  private readonly closeButtons: HTMLElement[];
  private readonly onTriggerClick?: (event: Event) => void;
  private readonly onCloseClick: (event: Event) => void;
  private destroyed = false;

  constructor(options: AnimatedModalOptions) {
    if (!options?.target) {
      throw new Error('AnimatedModal: target is required.');
    }
    const target = resolveElement(options.target, 'target') as HTMLElement;
    const modalName = target.id || `animated-modal-${instanceCounter++}`;
    if (!target.id) {
      target.id = modalName;
    }

    const merged: Required<AnimatedModalOptions> = {
      ...DEFAULT_OPTIONS,
      ...options,
      target,
      trigger: options.trigger ?? null,
      closeSelector: options.closeSelector ?? DEFAULT_OPTIONS.closeSelector,
    } as Required<AnimatedModalOptions>;

    this.options = merged;
    this.target = target;
    this.trigger = merged.trigger ? resolveElement(merged.trigger, 'trigger') : null;
    this.closeSelector = merged.closeSelector;
    this.modalName = modalName;
    this.closeButtons = Array.from(
      this.target.querySelectorAll<HTMLElement>(this.closeSelector),
    );

    this.initializeStyles();

    if (this.trigger) {
      this.onTriggerClick = (event: Event): void => {
        event.preventDefault();
        void this.open();
      };
      this.trigger.addEventListener('click', this.onTriggerClick);
    }

    this.onCloseClick = (event: Event): void => {
      event.preventDefault();
      void this.close();
    };
    this.closeButtons.forEach((button) => {
      button.addEventListener('click', this.onCloseClick);
    });
  }

  open = async (): Promise<void> => {
    if (this.destroyed) {
      return;
    }
    if (activeInstance && activeInstance !== this) {
      await activeInstance.close({ fast: true });
    }

    applyAnimationDuration(this.target, this.options.animationDuration);

    if (this.target.classList.contains(`${this.modalName}-off`)) {
      this.target.classList.remove(this.options.animatedOut, `${this.modalName}-off`);
      this.target.classList.add(`${this.modalName}-on`);
    }

    if (this.target.classList.contains(`${this.modalName}-on`)) {
      this.applyBeforeOpenDefaults();
      this.options.beforeOpen();
      this.target.style.opacity = String(this.options.opacityIn);
      this.target.style.zIndex = String(this.options.zIndexIn);
      this.target.classList.add(this.options.animatedIn);
      await waitForAnimation(this.target, this.options.animationDuration);
      this.applyAfterOpenDefaults();
      this.options.afterOpen();
      activeInstance = this;
    }
  };

  close = async (options?: { fast?: boolean }): Promise<void> => {
    if (this.destroyed) {
      return;
    }

    const duration = options?.fast ? '0s' : this.options.animationDuration;
    applyAnimationDuration(this.target, duration);
    this.applyBeforeCloseDefaults();
    this.options.beforeClose();

    if (this.target.classList.contains(`${this.modalName}-on`)) {
      this.target.classList.remove(`${this.modalName}-on`);
      this.target.classList.add(`${this.modalName}-off`);
    }

    if (this.target.classList.contains(`${this.modalName}-off`)) {
      this.target.classList.remove(this.options.animatedIn);
      this.target.classList.add(this.options.animatedOut);
      await waitForAnimation(this.target, duration);
    }

    this.applyAfterCloseDefaults();
    this.options.afterClose();
    applyAnimationDuration(this.target, this.options.animationDuration);

    if (activeInstance === this) {
      activeInstance = null;
    }
  };

  destroy = (): void => {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    if (this.trigger && this.onTriggerClick) {
      this.trigger.removeEventListener('click', this.onTriggerClick);
    }
    this.closeButtons.forEach((button) => {
      button.removeEventListener('click', this.onCloseClick);
    });

    if (activeInstance === this) {
      activeInstance = null;
    }
  };

  private initializeStyles(): void {
    this.target.classList.add('animated', `${this.modalName}-off`);

    this.target.style.position = this.options.position;
    this.target.style.width = this.options.width;
    this.target.style.height = this.options.height;
    this.target.style.top = this.options.top;
    this.target.style.left = this.options.left;
    this.target.style.zIndex = String(this.options.zIndexOut);
    this.target.style.opacity = String(this.options.opacityOut);

    applyAnimationDuration(this.target, this.options.animationDuration);
  }

  private applyAfterCloseDefaults(): void {
    const html = document.documentElement;
    html.style.overflowY = 'scroll';
    html.style.marginRight = '0';
    this.closeButtons.forEach((button) => {
      button.style.marginRight = '0';
    });
    this.target.style.overflowY = 'hidden';
    this.target.style.opacity = String(this.options.opacityOut);
    this.target.style.zIndex = String(this.options.zIndexOut);
  }

  private applyBeforeCloseDefaults(): void {
    const html = document.documentElement;
    html.style.overflowY = 'scroll';
    html.style.marginRight = '0';
    this.closeButtons.forEach((button) => {
      button.style.marginRight = '0';
    });
    this.target.style.overflowY = 'hidden';
  }

  private applyBeforeOpenDefaults(): void {
    const html = document.documentElement;
    html.style.overflowY = 'scroll';
    html.style.marginRight = '0';
    this.closeButtons.forEach((button) => {
      button.style.marginRight = '0';
    });
    this.target.style.overflowY = 'hidden';
  }

  private applyAfterOpenDefaults(): void {
    const html = document.documentElement;
    html.style.overflowY = 'hidden';
    const scrollBarWidth = getScrollBarWidth();
    html.style.marginRight = `${scrollBarWidth}px`;
    this.closeButtons.forEach((button) => {
      button.style.marginRight = `${scrollBarWidth}px`;
    });
    this.target.style.overflowY = 'scroll';
  }
}

export const createAnimatedModal = (options?: AnimatedModalOptions): AnimatedModalInstance => {
  if (!options) {
    throw new Error('AnimatedModal: options are required when creating an instance.');
  }
  return new AnimatedModal(options);
};

export type { AnimatedModalInstance, AnimatedModalOptions } from './types';

export default createAnimatedModal;
