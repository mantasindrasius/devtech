import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';
import { revealedPlayback } from './revealed-playback.js';
import { testSuitePanel } from './test-suite-panel.js';
import { runSuiteOnRepeat, showPassedSuite } from './test-suite-player.js';

const scenes = ['core', 'adapters'];

/** An application core tested in memory, then its ports and adapters under an E2E suite. */
export const testableDesignRenderer = {
  validate(resource) {
    requireText(resource.title, 'testable-design.title');
    requireText(resource.description, 'testable-design.description');
    if (!resource.file.endsWith('.svg')) throw new Error('Testable design must be SVG');
  },
  validateStep(step) {
    if (!scenes.includes(step.scene))
      throw new Error(`Unknown testable design scene: ${step.scene}`);
    requireText(step.caption, 'testable-design.caption');
  },
  create(resource, { wait, reducedMotion }) {
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel svg-illustration testable-design';
    const runs = [...story.panel.querySelectorAll('.test-suite')].map((element) => {
      const suite = testSuitePanel(element, story.panel);
      return revealedPlayback(element.closest('[data-appears-at]'), {
        play: (signal) => runSuiteOnRepeat(suite, { wait, signal }),
        showStill: () => showPassedSuite(suite),
        reset: () => suite.reset(),
        reducedMotion,
      });
    });
    return {
      panel: story.panel,
      show(step, options) {
        story.show(step, options);
        for (const run of runs) run.sync();
      },
      hide() {
        story.hide();
        for (const run of runs) run.stop();
      },
      dispose() {
        for (const run of runs) run.stop();
        story.dispose();
      },
    };
  },
};
