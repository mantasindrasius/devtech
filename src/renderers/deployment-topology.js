import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';

const scenes = ['monolith', 'microservices'];

export const deploymentTopologyRenderer = {
  validate(resource) {
    requireText(resource.title, 'deployment-topology.title');
    requireText(resource.description, 'deployment-topology.description');
    if (!resource.file.endsWith('.svg')) throw new Error('Deployment topology must be SVG');
  },
  validateStep(step) {
    if (!scenes.includes(step.scene)) throw new Error(`Unknown deployment scene: ${step.scene}`);
    requireText(step.caption, 'deployment-topology.caption');
  },
  create(resource) {
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel svg-illustration deployment-topology';
    return story;
  },
};
