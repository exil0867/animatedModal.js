type AnimationDuration = string | number;

type AnimatedModalCallbacks = {
  beforeOpen?: () => void;
  afterOpen?: () => void;
  beforeClose?: () => void;
  afterClose?: () => void;
};

export type AnimatedModalOptions = AnimatedModalCallbacks & {
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
  animationDuration?: AnimationDuration;
  closeTrigger?: string;
};

type ActiveState = {
  modal: HTMLElement | null;
  settings: AnimatedModalOptions | null;
};

const animatedModalManager: ActiveState = {
  modal: null,
  settings: null,
};

export const getAnimationDurationMs = (duration?: AnimationDuration): number => {
  if (!duration && duration !== 0) {
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

const applyAnimationDuration = (target: HTMLElement, duration: AnimationDuration): void => {
  const durationValue = typeof duration === 'number' ? `${duration}ms` : duration;
  target.style.animationDuration = durationValue;
  target.style.webkitAnimationDuration = durationValue;
};

const waitForAnimation = (target: HTMLElement, duration?: AnimationDuration): Promise<void> => {
  const durationMs = getAnimationDurationMs(duration);
  return new Promise((resolve) => {
    let resolved = false;
    const resolveOnce = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      resolve();
    };
    const timeoutId = window.setTimeout(resolveOnce, durationMs + 50);
    const handler = () => {
      window.clearTimeout(timeoutId);
      target.removeEventListener('animationend', handler);
      resolveOnce();
    };
    target.addEventListener('animationend', handler, { once: true });
    if (durationMs === 0) {
      window.clearTimeout(timeoutId);
      window.setTimeout(resolveOnce, 0);
    }
  });
};

const defaultOptions: Required<AnimatedModalOptions> = {
  modalTarget: '',
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
  animationDuration: '0.2s',
  closeTrigger: '[data-modal-close]',
  beforeOpen: () => undefined,
  afterOpen: () => undefined,
  beforeClose: () => undefined,
  afterClose: () => undefined,
};

const setActive = (modal: HTMLElement, settings: AnimatedModalOptions): void => {
  animatedModalManager.modal = modal;
  animatedModalManager.settings = settings;
};

const clearActive = (modal: HTMLElement): void => {
  if (animatedModalManager.modal === modal) {
    animatedModalManager.modal = null;
    animatedModalManager.settings = null;
  }
};

const getScrollBarWidth = (): number => {
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.overflow = 'scroll';
  document.body.append(outer);
  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.append(inner);
  const widthWithScroll = inner.offsetWidth;
  outer.remove();
  return 100 - widthWithScroll;
};

const applyInitStyles = (target: HTMLElement, settings: AnimatedModalOptions): void => {
  target.style.position = settings.position ?? '';
  target.style.width = settings.width ?? '';
  target.style.height = settings.height ?? '';
  target.style.top = settings.top ?? '';
  target.style.left = settings.left ?? '';
  target.style.zIndex = settings.zIndexOut ?? '';
  target.style.opacity = settings.opacityOut ?? '';
};

const addClasses = (target: HTMLElement, classes: string[]): void => {
  target.classList.add(...classes.filter(Boolean));
};

const removeClasses = (target: HTMLElement, classes: string[]): void => {
  classes.filter(Boolean).forEach((className) => target.classList.remove(className));
};

const hasClass = (target: HTMLElement, className: string): boolean => target.classList.contains(className);

const openModal = async (target: HTMLElement, settings: AnimatedModalOptions): Promise<void> => {
  applyAnimationDuration(target, settings.animationDuration ?? '0s');
  if (hasClass(target, `${settings.modalTarget}-off`)) {
    removeClasses(target, [settings.animatedOut ?? '', `${settings.modalTarget}-off`]);
    addClasses(target, [`${settings.modalTarget}-on`]);
  }

  if (hasClass(target, `${settings.modalTarget}-on`)) {
    settings.beforeOpen?.();
    target.style.opacity = settings.opacityIn ?? '';
    target.style.zIndex = settings.zIndexIn ?? '';
    removeClasses(target, ['animated-modal--off']);
    addClasses(target, ['animated-modal--on', settings.animatedIn ?? '']);
    await waitForAnimation(target, settings.animationDuration);
    settings.afterOpen?.();
    setActive(target, settings);
  }
};

const afterClose = (target: HTMLElement, settings: AnimatedModalOptions): void => {
  target.style.opacity = settings.opacityOut ?? '';
  target.style.zIndex = settings.zIndexOut ?? '';
  removeClasses(target, ['animated-modal--on']);
  addClasses(target, ['animated-modal--off']);
  settings.afterClose?.();
  clearActive(target);
};

const closeModal = async (
  target: HTMLElement,
  settings: AnimatedModalOptions,
  opts?: { fast?: boolean },
): Promise<void> => {
  const duration = opts?.fast ? '0s' : settings.animationDuration ?? '0s';
  applyAnimationDuration(target, duration);
  settings.beforeClose?.();

  if (hasClass(target, `${settings.modalTarget}-on`)) {
    removeClasses(target, [`${settings.modalTarget}-on`]);
    addClasses(target, [`${settings.modalTarget}-off`]);
  }

  if (hasClass(target, `${settings.modalTarget}-off`)) {
    removeClasses(target, [settings.animatedIn ?? '']);
    addClasses(target, [settings.animatedOut ?? '']);
    await waitForAnimation(target, duration);
    afterClose(target, settings);
  } else {
    afterClose(target, settings);
  }
  applyAnimationDuration(target, settings.animationDuration ?? '0s');
};

export const createAnimatedModal = (
  trigger: HTMLElement,
  options: AnimatedModalOptions = {},
): { destroy: () => void } => {
  const triggerElement = trigger;
  const modalTarget = options.modalTarget ?? triggerElement.getAttribute('href')?.replace('#', '') ?? '';
  if (!modalTarget) {
    return { destroy: () => undefined };
  }

  const target = document.getElementById(modalTarget);
  if (!target) {
    return { destroy: () => undefined };
  }

  const closeTrigger = options.closeTrigger ?? defaultOptions.closeTrigger;
  const closeButtons = Array.from(target.querySelectorAll<HTMLElement>(closeTrigger));

  const settings: AnimatedModalOptions = {
    ...defaultOptions,
    ...options,
    modalTarget,
    beforeOpen: () => {
      document.documentElement.style.overflowY = 'scroll';
      document.documentElement.style.marginRight = '0';
      closeButtons.forEach((button) => {
        button.style.marginRight = '0';
      });
      target.style.overflowY = 'hidden';
      options.beforeOpen?.();
    },
    afterOpen: () => {
      document.documentElement.style.overflowY = 'hidden';
      const scrollBarWidth = `${getScrollBarWidth()}px`;
      document.documentElement.style.marginRight = scrollBarWidth;
      closeButtons.forEach((button) => {
        button.style.marginRight = scrollBarWidth;
      });
      target.style.overflowY = 'scroll';
      options.afterOpen?.();
    },
    beforeClose: () => {
      document.documentElement.style.overflowY = 'scroll';
      document.documentElement.style.marginRight = '0';
      closeButtons.forEach((button) => {
        button.style.marginRight = '0';
      });
      target.style.overflowY = 'hidden';
      options.beforeClose?.();
    },
    afterClose: () => {
      options.afterClose?.();
    },
  };

  const baseClass = 'animated-modal';
  const onClass = 'animated-modal--on';
  const offClass = 'animated-modal--off';

  addClasses(target, ['animated', `${settings.modalTarget}-off`, baseClass, offClass]);
  applyInitStyles(target, settings);
  applyAnimationDuration(target, settings.animationDuration ?? '0s');

  const handleTriggerClick = async (event: Event) => {
    event.preventDefault();
    if (triggerElement.getAttribute('href') === `#${target.id}`) {
      if (animatedModalManager.modal && animatedModalManager.settings && animatedModalManager.modal !== target) {
        await closeModal(animatedModalManager.modal, animatedModalManager.settings, { fast: true });
      }
      await openModal(target, settings);
    }
  };

  const handleCloseClick = async (event: Event) => {
    event.preventDefault();
    await closeModal(target, settings);
  };

  triggerElement.addEventListener('click', handleTriggerClick);
  closeButtons.forEach((button) => button.addEventListener('click', handleCloseClick));

  const destroy = () => {
    triggerElement.removeEventListener('click', handleTriggerClick);
    closeButtons.forEach((button) => button.removeEventListener('click', handleCloseClick));
    removeClasses(target, [baseClass, onClass, offClass, `${settings.modalTarget}-off`, `${settings.modalTarget}-on`]);
  };

  return { destroy };
};

export default createAnimatedModal;
