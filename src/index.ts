export type AnimationDuration = number | string;

export interface OverlayOptions {
  enabled?: boolean;
  className?: string;
  closeOnClick?: boolean;
}

export interface CloseTriggers {
  escKey?: boolean;
  overlayClick?: boolean;
  closeButton?: boolean;
}

export interface AnimatedModalOptions {
  modal: HTMLElement;
  trigger?: HTMLElement;
  animatedInClass?: string;
  animatedOutClass?: string;
  animationDuration?: AnimationDuration;
  overlay?: OverlayOptions;
  closeTriggers?: CloseTriggers;
  closeButtonSelector?: string;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  role?: string;
  ariaModal?: boolean;
}

export class AnimatedModal {
  private modal: HTMLElement;
  private trigger?: HTMLElement;
  private overlay?: OverlayOptions;
  private closeTriggers: CloseTriggers;
  private closeButtonSelector: string;
  private animatedInClass: string;
  private animatedOutClass: string;
  private animationDuration: AnimationDuration;
  private trapFocus: boolean;
  private restoreFocus: boolean;
  private role: string;
  private ariaModal: boolean;
  private overlayElement: HTMLElement | null = null;
  private isOpen = false;
  private previousActiveElement: HTMLElement | null = null;
  private boundEscHandler = (event: KeyboardEvent) => this.handleEscKey(event);
  private boundOverlayClick = (event: MouseEvent) => this.handleOverlayClick(event);
  private boundTriggerClick = (event: MouseEvent) => this.handleTriggerClick(event);
  private boundKeydownTrap = (event: KeyboardEvent) => this.handleTrapFocus(event);
  private closeButtons: HTMLElement[] = [];

  constructor(options: AnimatedModalOptions) {
    this.modal = options.modal;
    this.trigger = options.trigger;
    this.animatedInClass = options.animatedInClass ?? 'fadeIn';
    this.animatedOutClass = options.animatedOutClass ?? 'fadeOut';
    this.animationDuration = options.animationDuration ?? '0.2s';
    this.overlay = {
      enabled: options.overlay?.enabled ?? true,
      className: options.overlay?.className ?? 'animated-modal__overlay',
      closeOnClick: options.overlay?.closeOnClick ?? true
    };
    this.closeTriggers = {
      escKey: options.closeTriggers?.escKey ?? true,
      overlayClick: options.closeTriggers?.overlayClick ?? true,
      closeButton: options.closeTriggers?.closeButton ?? true
    };
    this.closeButtonSelector = options.closeButtonSelector ?? '[data-animated-modal-close]';
    this.trapFocus = options.trapFocus ?? true;
    this.restoreFocus = options.restoreFocus ?? true;
    this.role = options.role ?? 'dialog';
    this.ariaModal = options.ariaModal ?? true;

    this.initialize();
  }

  private initialize() {
    this.modal.setAttribute('role', this.role);
    this.modal.setAttribute('aria-modal', String(this.ariaModal));
    if (!this.modal.hasAttribute('aria-hidden')) {
      this.modal.setAttribute('aria-hidden', 'true');
    }

    if (this.trigger) {
      this.trigger.addEventListener('click', this.boundTriggerClick);
    }

    if (!this.modal.hasAttribute('tabindex')) {
      this.modal.setAttribute('tabindex', '-1');
    }

    this.closeButtons = Array.from(
      this.modal.querySelectorAll<HTMLElement>(this.closeButtonSelector)
    );
    if (this.closeTriggers.closeButton) {
      this.closeButtons.forEach((button) => {
        button.addEventListener('click', () => this.close());
      });
    }

    this.setAnimationDuration(this.animationDuration);
  }

  private setAnimationDuration(duration: AnimationDuration) {
    const durationValue = typeof duration === 'number' ? `${duration}ms` : duration;
    this.modal.style.animationDuration = durationValue;
  }

  private handleTriggerClick(event: MouseEvent) {
    event.preventDefault();
    this.open();
  }

  private handleEscKey(event: KeyboardEvent) {
    if (event.key !== 'Escape') {
      return;
    }
    this.close();
  }

  private handleOverlayClick(event: MouseEvent) {
    if (event.target !== this.overlayElement) {
      return;
    }
    this.close();
  }

  private handleTrapFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) {
      event.preventDefault();
      this.modal.focus();
      return;
    }

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];
    return Array.from(
      this.modal.querySelectorAll<HTMLElement>(selectors.join(','))
    ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1);
  }

  private createOverlay() {
    if (!this.overlay?.enabled || this.overlayElement) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = this.overlay.className ?? 'animated-modal__overlay';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
    this.overlayElement = overlay;

    if (this.closeTriggers.overlayClick && this.overlay.closeOnClick) {
      overlay.addEventListener('click', this.boundOverlayClick);
    }
  }

  private cleanupOverlay() {
    if (!this.overlayElement) {
      return;
    }

    this.overlayElement.removeEventListener('click', this.boundOverlayClick);
    this.overlayElement.remove();
    this.overlayElement = null;
  }

  private async playAnimation(animationClass: string) {
    this.modal.classList.remove(this.animatedInClass, this.animatedOutClass);
    this.modal.classList.add(animationClass);
    await this.waitForAnimation();
  }

  private waitForAnimation(): Promise<void> {
    const durationMs = this.getAnimationDurationMs(this.animationDuration);
    if (durationMs === 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let resolved = false;
      const resolveOnce = () => {
        if (resolved) {
          return;
        }
        resolved = true;
        resolve();
      };

      const timeout = window.setTimeout(resolveOnce, durationMs + 50);
      this.modal.addEventListener(
        'animationend',
        () => {
          window.clearTimeout(timeout);
          resolveOnce();
        },
        { once: true }
      );
    });
  }

  private getAnimationDurationMs(duration: AnimationDuration): number {
    if (typeof duration === 'number') {
      return duration;
    }
    const normalized = duration.trim();
    if (normalized.endsWith('ms')) {
      return Number.parseFloat(normalized);
    }
    if (normalized.endsWith('s')) {
      return Number.parseFloat(normalized) * 1000;
    }
    return Number.parseFloat(normalized);
  }

  async open() {
    if (this.isOpen) {
      return;
    }

    this.isOpen = true;
    this.previousActiveElement = document.activeElement as HTMLElement | null;
    this.modal.setAttribute('aria-hidden', 'false');
    this.modal.classList.add('animated-modal--active');

    this.createOverlay();

    if (this.closeTriggers.escKey) {
      document.addEventListener('keydown', this.boundEscHandler);
    }

    if (this.trapFocus) {
      this.modal.addEventListener('keydown', this.boundKeydownTrap);
    }

    await this.playAnimation(this.animatedInClass);

    if (this.trapFocus) {
      const focusable = this.getFocusableElements();
      (focusable[0] ?? this.modal).focus();
    }
  }

  async close() {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;

    if (this.closeTriggers.escKey) {
      document.removeEventListener('keydown', this.boundEscHandler);
    }

    if (this.trapFocus) {
      this.modal.removeEventListener('keydown', this.boundKeydownTrap);
    }

    await this.playAnimation(this.animatedOutClass);

    this.modal.classList.remove('animated-modal--active');
    this.modal.setAttribute('aria-hidden', 'true');

    this.cleanupOverlay();

    if (this.restoreFocus && this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  destroy() {
    if (this.trigger) {
      this.trigger.removeEventListener('click', this.boundTriggerClick);
    }

    if (this.closeTriggers.escKey) {
      document.removeEventListener('keydown', this.boundEscHandler);
    }

    if (this.trapFocus) {
      this.modal.removeEventListener('keydown', this.boundKeydownTrap);
    }

    this.cleanupOverlay();
    this.closeButtons.forEach((button) => {
      button.replaceWith(button.cloneNode(true));
    });
  }
}

export interface AutoInitOptions {
  selector?: string;
  overlayClass?: string;
}

function parseBoolean(value: string | null, fallback: boolean) {
  if (value === null) {
    return fallback;
  }
  return value === 'true' || value === '1' || value === '';
}

function parseDuration(value: string | null, fallback: AnimationDuration) {
  if (!value) {
    return fallback;
  }
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return numeric;
  }
  return value;
}

export function autoInitAnimatedModal(options: AutoInitOptions = {}) {
  const selector = options.selector ?? '[data-animated-modal]';
  const triggers = document.querySelectorAll<HTMLElement>(selector);

  triggers.forEach((trigger) => {
    const targetSelector = trigger.dataset.animatedModal;
    if (!targetSelector) {
      return;
    }

    const modal = document.querySelector<HTMLElement>(targetSelector);
    if (!modal) {
      return;
    }

    new AnimatedModal({
      modal,
      trigger,
      animatedInClass: trigger.dataset.animatedModalIn ?? undefined,
      animatedOutClass: trigger.dataset.animatedModalOut ?? undefined,
      animationDuration: parseDuration(trigger.dataset.animatedModalDuration, '0.2s'),
      overlay: {
        enabled: parseBoolean(trigger.dataset.animatedModalOverlay, true),
        className: trigger.dataset.animatedModalOverlayClass ?? options.overlayClass,
        closeOnClick: parseBoolean(trigger.dataset.animatedModalOverlayClick, true)
      },
      closeTriggers: {
        escKey: parseBoolean(trigger.dataset.animatedModalEsc, true),
        overlayClick: parseBoolean(trigger.dataset.animatedModalOverlayClick, true),
        closeButton: parseBoolean(trigger.dataset.animatedModalCloseButton, true)
      }
    });
  });
}
