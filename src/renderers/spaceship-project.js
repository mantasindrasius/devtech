import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';
import { addParallelSpacecraft } from './parallel-spacecraft.js';

const scenes = ['shipyard', 'first-ship', 'second-ship', 'third-ship'];

export function validateSpaceshipStep(step) {
  if (!scenes.includes(step.scene)) throw new Error(`Unknown spaceship scene: ${step.scene}`);
  requireText(step.caption, `spaceship ${step.scene}.caption`);
}

export function createSpaceshipPanel(resource) {
  return createArchitectureStory(resource, scenes, { prepareArt: addParallelSpacecraft });
}
