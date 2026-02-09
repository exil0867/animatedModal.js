const { describe, it, beforeEach, afterEach, expect, vi } = require('vitest');
const $ = require('jquery');

global.jQuery = $;
global.$ = $;

require('../animatedModal.js');

const flushTimers = async () => {
  vi.runAllTimers();
  await Promise.resolve();
};

const setupDom = () => {
  document.body.innerHTML = `
    <button id="outside">Outside</button>
    <a id="trigger" href="#modal">Open</a>
    <div id="modal">
      <button data-modal-close id="close">Close</button>
      <button id="first">First</button>
      <button id="last">Last</button>
    </div>
  `;
};

describe('animatedModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setupDom();
    $('#trigger').animatedModal({
      animationDuration: 0,
      overlay: true,
      escapeClose: true
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('toggles open/close classes and aria attributes', async () => {
    const modal = $('#modal');
    expect(modal.hasClass('modal-off')).toBe(true);
    expect(modal.attr('aria-hidden')).toBe('true');

    $('#trigger').trigger('click');
    await flushTimers();

    expect(modal.hasClass('modal-on')).toBe(true);
    expect(modal.attr('aria-hidden')).toBe('false');

    $('#close').trigger('click');
    await flushTimers();

    expect(modal.hasClass('modal-off')).toBe(true);
    expect(modal.attr('aria-hidden')).toBe('true');
  });

  it('creates and removes the overlay', async () => {
    $('#trigger').trigger('click');
    await flushTimers();

    expect($('.animated-modal-overlay').length).toBe(1);

    $('#close').trigger('click');
    await flushTimers();

    expect($('.animated-modal-overlay').length).toBe(0);
  });

  it('closes on escape key when enabled', async () => {
    const modal = $('#modal');
    $('#trigger').trigger('click');
    await flushTimers();

    expect(modal.hasClass('modal-on')).toBe(true);

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 });
    document.dispatchEvent(escEvent);
    await flushTimers();

    expect(modal.hasClass('modal-off')).toBe(true);
  });

  it('traps focus and restores on close', async () => {
    const outside = document.getElementById('outside');
    outside.focus();
    expect(document.activeElement).toBe(outside);

    $('#trigger').trigger('click');
    await flushTimers();

    const first = document.getElementById('first');
    const last = document.getElementById('last');

    expect(document.activeElement).toBe(first);

    last.focus();
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    document.dispatchEvent(tabEvent);
    expect(document.activeElement).toBe(first);

    $('#close').trigger('click');
    await flushTimers();

    expect(document.activeElement).toBe(outside);
  });
});
