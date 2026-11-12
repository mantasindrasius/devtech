import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';

const scenes = ['fast', 'deterministic', 'assertive', 'readable'];

export const idealTestRenderer = {
  validate(resource) {
    requireText(resource.title, 'ideal-test.title');
    requireText(resource.description, 'ideal-test.description');
    requireText(resource.code, 'ideal-test.code');
    if (!resource.file.endsWith('.svg')) throw new Error('Ideal test must be SVG');
  },
  validateStep(step) {
    if (!scenes.includes(step.scene)) throw new Error(`Unknown test attribute: ${step.scene}`);
    requireText(step.caption, 'ideal-test.caption');
  },
  create(resource, { monaco, resources }) {
    const snippet = resources[resource.code];
    if (snippet?.type !== 'code') throw new Error(`Unknown test code: ${resource.code}`);
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel svg-illustration ideal-test';
    const container = story.panel.querySelector('.ideal-test-editor');
    const model = monaco.editor.createModel(snippet.source, snippet.language);
    const editor = monaco.editor.create(container, {
      model, readOnly: true, domReadOnly: true, automaticLayout: true,
      minimap: { enabled: false }, wordWrap: 'off',
      fontSize: 26, lineHeight: 31, padding: { top: 16, bottom: 16 },
      fontFamily: '"SFMono-Regular", Consolas, monospace',
      lineNumbers: 'off', folding: false, glyphMargin: false,
      scrollBeyondLastLine: false, renderValidationDecorations: 'off',
      renderLineHighlight: 'none', overviewRulerLanes: 0,
      stickyScroll: { enabled: false }, ariaLabel: 'Readable fluent test example',
    });
    return {
      ...story,
      show(step, options) {
        story.show(step, options);
        container.inert = step.scene !== 'readable';
        if (step.scene === 'readable') editor.layout();
      },
      dispose() {
        editor.dispose();
        model.dispose();
        story.dispose();
      },
    };
  },
};
