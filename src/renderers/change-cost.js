import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';

const scenes = ['growing', 'goal'];

export const changeCostRenderer = {
  validate(resource) {
    requireText(resource.title, 'change-cost.title');
    requireText(resource.description, 'change-cost.description');
    if (!resource.file.endsWith('.svg')) throw new Error('Change cost must be SVG');
  },
  validateStep(step) {
    if (!scenes.includes(step.scene)) throw new Error(`Unknown change-cost scene: ${step.scene}`);
    requireText(step.caption, 'change-cost.caption');
  },
  create(resource) {
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel svg-illustration change-cost';
    return story;
  },
};
