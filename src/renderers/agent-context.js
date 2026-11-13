import { requireText } from '../content/validation.js';
import { patrolModules, showAgentAtWork } from './agent-patrol-player.js';
import { createArchitectureStory } from './architecture-story.js';
import { contextAgent } from './context-agent.js';
import { revealedPlayback } from './revealed-playback.js';

const scenes = ['intro', 'monolith', 'modular'];

export const agentContextRenderer = {
  validate(resource) {
    requireText(resource.title, 'agent-context.title');
    requireText(resource.description, 'agent-context.description');
    if (!resource.file.endsWith('.svg')) throw new Error('Agent context resource must be SVG');
  },
  validateStep(step) {
    if (!scenes.includes(step.scene)) throw new Error(`Unknown agent context scene: ${step.scene}`);
    requireText(step.caption, 'agent-context.caption');
  },
  create(resource, { wait, reducedMotion }) {
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel svg-illustration agent-context';
    const patrols = [...story.panel.querySelectorAll('.context-agent')].map((element) => {
      const agent = contextAgent(element);
      return revealedPlayback(element.closest('[data-appears-at]'), {
        play: (signal) => patrolModules(agent, { wait, signal }),
        showStill: () => showAgentAtWork(agent),
        reset: () => agent.reset(),
        reducedMotion,
      });
    });
    return {
      panel: story.panel,
      show(step, options) {
        story.show(step, options);
        for (const patrol of patrols) patrol.sync();
      },
      hide() {
        story.hide();
        for (const patrol of patrols) patrol.stop();
      },
      dispose() {
        for (const patrol of patrols) patrol.stop();
        story.dispose();
      },
    };
  },
};
