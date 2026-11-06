import { createTypingStep } from '../../src/steps/typing-step.js';

export function aTypingDemo() {
  const savedCode = 'total > 0';
  let visibleCode = savedCode;
  let reduced = false;
  let paused = false;
  let resume;
  let notifyPaused;
  const reachedPause = new Promise((resolve) => {
    notifyPaused = resolve;
  });
  const events = [];
  const controller = new AbortController();
  const command = createTypingStep(
    { find: savedCode, replacement: 'total >= 0', zoom: true },
    {
      code: {
        beginEdit: () => ({
          position: {},
          markRemoval: () => events.push('removal'),
          replace: (text) => {
            visibleCode = text;
          },
          finish: () => events.push('finished'),
          dispose: () => {
            visibleCode = savedCode;
          },
        }),
      },
      reducedMotion: () => reduced,
      camera: {
        focus: async () => events.push('zoom-in'),
        restore: async () => events.push('zoom-out'),
        reset() {},
      },
      wait: async (_, signal) => {
        if (paused)
          await new Promise((resolve) => {
            resume = resolve;
            notifyPaused();
          });
        signal.throwIfAborted();
      },
    },
  );
  return {
    withReducedMotion() {
      reduced = true;
      return this;
    },
    pausedAtFirstDelay() {
      paused = true;
      return this;
    },
    whenPaused: () => reachedPause,
    play: () => command.run({ signal: controller.signal, animate: true }),
    restoreInstantly: () => command.run({ signal: controller.signal, animate: false }),
    cancel() {
      controller.abort();
      command.dispose();
      resume?.();
    },
    dispose: () => command.dispose(),
    savedCode: () => savedCode,
    visibleCode: () => visibleCode,
    events: () => events,
  };
}
