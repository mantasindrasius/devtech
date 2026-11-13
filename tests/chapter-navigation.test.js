import { expect, test } from 'bun:test';
import { bindControls } from '../src/ui/controls.js';

function aChapterPresentation() {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  const document = Object.assign(new EventTarget(), {
    documentElement: { classList: { toggle() {} } },
  });
  const window = Object.assign(new EventTarget(), { getSelection: () => null });
  globalThis.document = document;
  globalThis.window = window;
  const nodes = new Map();
  const root = {
    querySelector(selector) {
      if (!nodes.has(selector)) nodes.set(selector, Object.assign(new EventTarget(), {
        querySelector: () => ({}), setAttribute() {}, contains: () => false,
        closest: (selectors) => selectors.includes('#slide[data-layout="chapter"]') ? root : null,
      }));
      return nodes.get(selector);
    },
    querySelectorAll: () => [],
  };
  const observed = { advances: 0, selected: [] };
  const dispose = bindControls({
    root, editor: { layout() {} },
    timeline: {
      next: () => observed.advances++,
      snapshot: () => ({ slideIndex: 3 }),
      select: (index) => observed.selected.push(index),
    },
  });
  function dispatch(type, fields) {
    const event = Object.assign(new Event(type, { cancelable: true }), fields);
    root.querySelector('#slide').dispatchEvent(event);
    return event.defaultPrevented;
  }
  return {
    tap: () => dispatch('click', { button: 0 }),
    swipeBack() {
      dispatch('touchstart', { touches: [{ clientX: 120, clientY: 200 }] });
      dispatch('touchmove', { touches: [{ clientX: 220, clientY: 205 }] });
      return dispatch('touchend', {
        touches: [], changedTouches: [{ clientX: 260, clientY: 205 }],
      });
    },
    observed,
    dispose() {
      dispose();
      globalThis.document = previousDocument;
      globalThis.window = previousWindow;
    },
  };
}

test('chapter taps advance and right swipes select the previous slide', () => {
  const presentation = aChapterPresentation();
  try {
    presentation.tap();
    const suppressedClick = presentation.swipeBack();

    expect(presentation.observed).toEqual({ advances: 1, selected: [2] });
    expect(suppressedClick).toBe(true);
  } finally {
    presentation.dispose();
  }
});
