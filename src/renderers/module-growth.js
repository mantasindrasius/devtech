import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';

const scenes = ['quotes', 'catalog', 'checkout', 'orders'];

export const moduleGrowthRenderer = {
  validate(resource) {
    requireText(resource.title, 'module-growth.title');
    requireText(resource.description, 'module-growth.description');
    if (!resource.file.endsWith('.svg')) throw new Error('Module growth must be SVG');
  },
  validateStep(step) {
    if (!scenes.includes(step.scene)) throw new Error(`Unknown module-growth scene: ${step.scene}`);
    requireText(step.caption, 'module-growth.caption');
  },
  create(resource) {
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel svg-illustration testable-design';
    return story;
  },
};
