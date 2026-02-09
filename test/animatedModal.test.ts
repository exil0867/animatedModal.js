import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createAnimatedModal } from '../src/index';

describe('animatedModal', () => {
  const setupDom = () => {
    document.body.innerHTML = `
      <a id="open" href="#demo">Open</a>
      <div id="demo">
        <button data-modal-close>Close</button>
      </div>
      <a id="open-two" href="#demo-two">Open Two</a>
      <div id="demo-two">
        <button data-modal-close>Close</button>
      </div>
    `;
  };

  beforeEach(() => {
    setupDom();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens and closes a modal with default classes', async () => {
    vi.useFakeTimers();
    const trigger = document.getElementById('open');
    const modal = document.getElementById('demo');

    expect(trigger).not.toBeNull();
    expect(modal).not.toBeNull();

    createAnimatedModal(trigger!, { animationDuration: '0s' });

    trigger!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await vi.runAllTimersAsync();

    expect(modal!.classList.contains('animated-modal--on')).toBe(true);
    expect(modal!.classList.contains('animated-modal--off')).toBe(false);

    const closeButton = modal!.querySelector('[data-modal-close]') as HTMLElement;
    closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await vi.runAllTimersAsync();

    expect(modal!.classList.contains('animated-modal--off')).toBe(true);
  });

  it('closes an active modal when opening another one', async () => {
    vi.useFakeTimers();
    const trigger = document.getElementById('open');
    const secondTrigger = document.getElementById('open-two');
    const firstModal = document.getElementById('demo');
    const secondModal = document.getElementById('demo-two');

    createAnimatedModal(trigger!, { animationDuration: '0s' });
    createAnimatedModal(secondTrigger!, { animationDuration: '0s' });

    trigger!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await vi.runAllTimersAsync();

    expect(firstModal!.classList.contains('animated-modal--on')).toBe(true);

    secondTrigger!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await vi.runAllTimersAsync();

    expect(firstModal!.classList.contains('animated-modal--off')).toBe(true);
    expect(secondModal!.classList.contains('animated-modal--on')).toBe(true);
  });
});
