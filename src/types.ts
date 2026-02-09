export type ElementOrSelector = Element | string;

export interface AnimatedModalOptions {
  target: ElementOrSelector;
  trigger?: ElementOrSelector;
  closeSelector?: string;
  position?: string;
  width?: string;
  height?: string;
  top?: string;
  left?: string;
  zIndexIn?: string | number;
  zIndexOut?: string | number;
  opacityIn?: string | number;
  opacityOut?: string | number;
  animatedIn?: string;
  animatedOut?: string;
  animationDuration?: string | number;
  beforeOpen?: () => void;
  afterOpen?: () => void;
  beforeClose?: () => void;
  afterClose?: () => void;
}

export interface AnimatedModalInstance {
  open: () => Promise<void>;
  close: (options?: { fast?: boolean }) => Promise<void>;
  destroy: () => void;
}
