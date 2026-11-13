import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';

const scenes = ['front', 'back'];

/**
 * Cards drawn in an SVG turn over on a click. Each card is a group holding a
 * `.flip-front` and a `.flip-back` of the same size; CSS turns the scene into the flip.
 */
export const flipCardsRenderer = {
  validate(resource) {
    requireText(resource.title, 'flip-cards.title');
    requireText(resource.description, 'flip-cards.description');
    if (!resource.file.endsWith('.svg')) throw new Error('Flip cards resource must be SVG');
  },
  validateStep(step) {
    if (!scenes.includes(step.scene)) throw new Error(`Unknown flip cards scene: ${step.scene}`);
    requireText(step.caption, 'flip-cards.caption');
  },
  create(resource) {
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel svg-illustration flip-cards';
    return story;
  },
};
