import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';

const scenes = ['pyramid', 'e2e', 'integration', 'unit', 'diamond', 'parallel'];

export const testingPyramidRenderer = {
  validate(resource) {
    requireText(resource.title, 'testing-pyramid.title');
    requireText(resource.description, 'testing-pyramid.description');
    if (!resource.file.endsWith('.svg')) throw new Error('Testing pyramid must be SVG');
  },
  validateStep(step) {
    if (!scenes.includes(step.scene)) throw new Error(`Unknown testing scene: ${step.scene}`);
    requireText(step.caption, 'testing-pyramid.caption');
  },
  create(resource) {
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel svg-illustration testing-pyramid';
    return story;
  },
};
