import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';

export const svgSequenceRenderer = {
  validate(resource) {
    requireText(resource.title, 'svg-sequence.title');
    requireText(resource.description, 'svg-sequence.description');
    if (!resource.file.endsWith('.svg')) throw new Error('SVG sequence must use SVG');
    if (!Array.isArray(resource.scenes) || !resource.scenes.length)
      throw new Error('SVG sequence needs scenes');
    resource.scenes.forEach((scene) => requireText(scene, 'svg-sequence.scene'));
    if (new Set(resource.scenes).size !== resource.scenes.length)
      throw new Error('SVG sequence scenes must be unique');
  },
  validateStep(step, resource) {
    if (!resource.scenes.includes(step.scene)) throw new Error(`Unknown SVG scene: ${step.scene}`);
    requireText(step.caption, 'svg-sequence.caption');
  },
  create(resource) {
    const story = createArchitectureStory(resource, resource.scenes);
    story.panel.className = 'visual-panel svg-illustration svg-sequence';
    return story;
  },
};
