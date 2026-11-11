import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';

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
  create(resource) {
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel svg-illustration agent-context';
    return story;
  },
};
