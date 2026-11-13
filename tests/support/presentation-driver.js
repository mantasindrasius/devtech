import { Registry } from '../../src/core/registry.js';
import { createTimeline } from '../../src/core/timeline.js';

export function aPresentation() {
  const actions = new Registry('step action');
  const observed = { events: [], errors: [], cleanups: 0, shown: [], completed: [] };
  let steps = [{ id: 'start', label: 'Start' }];
  let slides;
  let timeline;
  return {
    withSteps(value) {
      steps = value;
      return this;
    },
    withSlides(value) {
      slides = value;
      return this;
    },
    withAction(kind, create) {
      actions.register(kind, { create });
      return this;
    },
    withRecordingAction(kind) {
      return this.withAction(kind, (options) => ({
        run: ({ animate }) => {
          observed.events.push({ name: options.name, animate });
        },
        dispose: () => {
          observed.cleanups++;
        },
      }));
    },
    mount() {
      timeline = createTimeline({
        deck: { slides: slides ?? [{ id: 'example', code: 'sample', steps }] },
        actions,
        context: { code: { show() {} }, checks: { clear() {} } },
        view: {
          show: (state) => observed.shown.push(state.step.id),
          completed: (state) => observed.completed.push(state.step.id),
          error: (error) => observed.errors.push(error.message),
        },
      });
      return timeline.select(0);
    },
    next: () => timeline.next(),
    previous: () => timeline.previous(),
    replay: () => timeline.replay(),
    dispose: () => timeline.dispose(),
    observations: () => observed,
  };
}
