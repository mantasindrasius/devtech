import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';

const scenes = ['monolith', 'microservices', 'ai-era'];

export const planetEvolutionRenderer = {
  validate(resource) {
    requireText(resource.title, 'planet-evolution.title');
    requireText(resource.description, 'planet-evolution.description');
    if (!resource.file.endsWith('.svg')) throw new Error('Planet evolution resource must be SVG');
  },
  validateStep(step) {
    if (!scenes.includes(step.scene))
      throw new Error(`Unknown planet evolution scene: ${step.scene}`);
    requireText(step.caption, 'planet-evolution.caption');
  },
  create(resource) {
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel architecture-story planet-evolution';
    return story;
  },
};
