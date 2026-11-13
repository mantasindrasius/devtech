import { expect, test } from 'bun:test';
import { bindSwipeNavigation } from '../src/ui/swipe-navigation.js';

function aTouchSlide({ editor = false } = {}) {
  const element = new EventTarget();
  element.closest = () => editor;
  const lifecycle = new AbortController();
  let backs = 0;
  bindSwipeNavigation(element, () => backs++, lifecycle.signal);
  function touch(type, x, y, count = 1) {
    const event = new Event(type, { cancelable: true });
    const point = { clientX: x, clientY: y };
    event.touches = type === 'touchend' ? [] : Array(count).fill(point);
    event.changedTouches = [point];
    element.dispatchEvent(event);
    return event.defaultPrevented;
  }
  return {
    start: () => touch('touchstart', 100, 100),
    move: (x, y, count) => touch('touchmove', x, y, count),
    end: (x, y) => touch('touchend', x, y),
    cancel: () => touch('touchcancel', 100, 100),
    dispose: () => lifecycle.abort(),
    backs: () => backs,
  };
}

test('a rightward swipe goes back once and suppresses the following click', () => {
  const slide = aTouchSlide();
  slide.start();

  slide.move(180, 105);
  const suppressed = slide.end(200, 110);

  expect(slide.backs()).toBe(1);
  expect(suppressed).toBe(true);
  slide.dispose();
});

test.each([
  ['tap', 105, 100], ['leftward swipe', 0, 100], ['vertical scroll', 120, 220],
])('%s does not navigate', (_, x, y) => {
  const slide = aTouchSlide();
  slide.start();

  slide.move(x, y);
  slide.end(x, y);

  expect(slide.backs()).toBe(0);
  slide.dispose();
});

test.each(['editor', 'cancelled', 'multi-touch', 'disposed'])('%s gestures do not navigate', (kind) => {
  const slide = aTouchSlide({ editor: kind === 'editor' });
  slide.start();
  const interrupt = {
    editor: () => {}, cancelled: slide.cancel,
    'multi-touch': () => slide.move(150, 100, 2), disposed: slide.dispose,
  };

  interrupt[kind]();
  slide.end(220, 100);

  expect(slide.backs()).toBe(0);
  slide.dispose();
});
