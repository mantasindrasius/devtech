import { bindSwipeNavigation } from './swipe-navigation.js';

export function bindControls({ root, timeline, code, checks, editor }) {
  const lifecycle = new AbortController();
  const listen = (element, event, handler) =>
    element.addEventListener(event, handler, { signal: lifecycle.signal });
  const $ = (id) => root.querySelector(`#${id}`);
  bindSwipeNavigation(
    $('slide'),
    () => timeline.select(timeline.snapshot().slideIndex - 1),
    lifecycle.signal,
  );
  let presenting = false;
  function setPresenting(active) {
    presenting = active;
    document.documentElement.classList.toggle('presenting', active);
    $('present').querySelector('span').textContent = active ? 'Exit presentation' : 'Present';
    $('present').setAttribute('aria-pressed', String(active));
    if (active && root.querySelector('.topbar').contains(document.activeElement))
      document.activeElement.blur();
    editor.layout();
  }
  async function togglePresentation() {
    setPresenting(!presenting);
    try {
      if (presenting && !document.fullscreenElement)
        await document.documentElement.requestFullscreen();
      else if (!presenting && document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* Embedded browsers still support the presentation layout. */
    }
  }
  listen($('present'), 'click', togglePresentation);
  listen($('next'), 'click', () => timeline.next());
  listen($('slide'), 'click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey) return;
    if (!event.target.closest('.visual-art, .code-comparison, #slide[data-layout="chapter"]')) return;
    if (event.target.closest('.monaco-editor') && !event.target.closest('[data-advance-on-click]')) return;
    if (event.target.closest('a, button, input, textarea, [contenteditable]')) return;
    if (window.getSelection()?.toString()) return;
    timeline.next();
  });
  listen($('previous'), 'click', () => timeline.previous());
  listen($('replay'), 'click', () => timeline.replay());
  listen($('reset'), 'click', async () => {
    await timeline.replay();
    code.reset();
  });
  listen($('run'), 'click', () => checks.run());
  listen($('notes-toggle'), 'click', () => {
    $('notes').hidden = !$('notes').hidden;
    $('notes-toggle').setAttribute('aria-expanded', String(!$('notes').hidden));
  });
  root
    .querySelectorAll('[data-slide]')
    .forEach((button) =>
      listen(button, 'click', () => timeline.select(Number(button.dataset.slide))),
    );
  listen(window, 'hashchange', () => timeline.select(slideFromHash()));
  listen(document, 'fullscreenchange', () => setPresenting(Boolean(document.fullscreenElement)));
  document.addEventListener('keydown', onEscape, {
    capture: true,
    signal: lifecycle.signal,
  });
  listen(document, 'keydown', onKey);
  setPresenting(false);
  return () => lifecycle.abort();

  function onEscape(event) {
    // Programmatic Escape closes Monaco menus during step cleanup.
    if (event.key !== 'Escape' || !event.isTrusted || !presenting) return;
    event.preventDefault();
    event.stopPropagation();
    setPresenting(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  function onKey(event) {
    if (event.target?.closest?.('select')) return;
    if (event.defaultPrevented || event.target?.closest?.('.context-view')) return;
    if (editor.hasTextFocus() || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.repeat) return;
    if (presenting && event.key === ' ' && !event.target?.closest?.('button, a, input, textarea')) {
      event.preventDefault();
      (event.shiftKey ? timeline.previous() : timeline.next());
      return;
    }
    const commands = {
      ArrowRight: () => timeline.next(),
      ArrowDown: () => timeline.next(),
      PageDown: () => timeline.next(),
      ArrowLeft: () => timeline.previous(),
      ArrowUp: () => timeline.previous(),
      PageUp: () => timeline.previous(),
      n: () => $('notes-toggle').click(),
      f: togglePresentation,
    };
    const command = commands[event.key];
    if (command) {
      event.preventDefault();
      command();
    }
  }
}

export function slideFromHash() {
  const value = Number(location.hash.slice(1));
  return Number.isInteger(value) && value > 0 ? value - 1 : 0;
}
