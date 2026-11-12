import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';

const scenes = ['title', 'points'];

/**
 * Opens a topic like a separator slide: its `.topic-title` fills the stage, then
 * settles into the heading above the topic's points.
 */
export const topicIntroRenderer = {
  validate(resource) {
    requireText(resource.title, 'topic-intro.title');
    requireText(resource.description, 'topic-intro.description');
    if (!resource.file.endsWith('.svg')) throw new Error('Topic intro resource must be SVG');
  },
  validateStep(step) {
    if (!scenes.includes(step.scene)) throw new Error(`Unknown topic intro scene: ${step.scene}`);
    requireText(step.caption, 'topic-intro.caption');
  },
  create(resource) {
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel svg-illustration topic-intro';
    return story;
  },
};
