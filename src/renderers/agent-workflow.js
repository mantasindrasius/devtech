import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';

const phases = ['intro', 'explore', 'plan', 'implement'];

export const agentWorkflowRenderer = {
  validate(resource) {
    requireText(resource.title, 'agent-workflow.title');
    requireText(resource.description, 'agent-workflow.description');
    if (!resource.file.endsWith('.svg')) throw new Error('Agent workflow resource must be SVG');
  },
  validateStep(step) {
    if (!phases.includes(step.scene)) throw new Error(`Unknown workflow phase: ${step.scene}`);
    requireText(step.caption, 'agent-workflow.caption');
  },
  create(resource) {
    const story = createArchitectureStory(resource, phases);
    story.panel.className = 'visual-panel svg-illustration agent-workflow';
    return story;
  },
};
