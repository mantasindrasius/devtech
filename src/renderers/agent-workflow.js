import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';
import { revealedPlayback } from './revealed-playback.js';
import { playToolCalls, showCompletedToolCalls } from './tool-call-player.js';
import { toolCallTranscript } from './tool-call-transcript.js';

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
  create(resource, { wait, reducedMotion }) {
    const story = createArchitectureStory(resource, phases);
    story.panel.className = 'visual-panel svg-illustration agent-workflow';
    const sessions = [...story.panel.querySelectorAll('.tool-transcript')].map((element) => {
      const transcript = toolCallTranscript(element);
      return revealedPlayback(element.closest('[data-appears-at]'), {
        play: (signal) => playToolCalls(transcript, { wait, signal }),
        showStill: () => showCompletedToolCalls(transcript),
        reset: () => transcript.clear(),
        reducedMotion,
      });
    });
    return {
      panel: story.panel,
      show(step, options) {
        story.show(step, options);
        sessions.forEach((session, index) => {
          session.sync({ active: index + 1 === phases.indexOf(step.scene) });
        });
      },
      hide() {
        story.hide();
        for (const session of sessions) session.stop();
      },
      dispose() {
        for (const session of sessions) session.stop();
        story.dispose();
      },
    };
  },
};
