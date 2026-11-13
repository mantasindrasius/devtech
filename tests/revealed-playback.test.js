import { expect, test } from 'bun:test';
import { revealedPlayback } from '../src/renderers/revealed-playback.js';

function aRevealedAnimation() {
  const signals = [];
  let resets = 0;
  const playback = revealedPlayback({ classList: { contains: () => true } }, {
    play: (signal) => signals.push(signal),
    showStill() {},
    reset: () => resets++,
    reducedMotion: () => false,
  });
  return {
    activate() { playback.sync(); return this; },
    deactivate() { playback.sync({ active: false }); return this; },
    stop() { playback.stop(); return this; },
    signals: () => signals,
    resets: () => resets,
  };
}

test('deactivation cancels playback without clearing the visible transcript', () => {
  const animation = aRevealedAnimation().activate();

  animation.deactivate();

  expect(animation.signals()[0].aborted).toBe(true);
  expect(animation.resets()).toBe(0);
});

test('reactivation starts fresh playback and leaving clears the transcript', () => {
  const animation = aRevealedAnimation().activate().deactivate();

  animation.activate().stop();

  expect(animation.signals()).toHaveLength(2);
  expect(animation.signals().every((signal) => signal.aborted)).toBe(true);
  expect(animation.resets()).toBe(1);
});
