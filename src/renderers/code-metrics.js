import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';
import { coverageDecorations } from './coverage-decorations.js';

const scenes = ['intro', 'lizard', 'low', 'high', 'cleanup'];

export const codeMetricsRenderer = {
  validate(resource) {
    for (const key of ['title', 'description', 'lowCode', 'highCode'])
      requireText(resource[key], `code-metrics.${key}`);
    for (const kind of ['low', 'high']) coverageDecorations(resource.coverage?.[kind], Infinity);
  },
  validateStep(step) {
    if (!scenes.includes(step.scene)) throw new Error(`Unknown metrics scene: ${step.scene}`);
  },
  create(resource, { monaco, resources }) {
    const snippets = ['low', 'high'].map((kind) => {
      const snippet = resources[resource[`${kind}Code`]];
      if (snippet?.type !== 'code') throw new Error(`Missing ${kind} CRAP example`);
      return [kind, snippet];
    });
    const models = Object.fromEntries(snippets.map(([kind, snippet]) =>
      [kind, monaco.editor.createModel(snippet.source, snippet.language)]));
    for (const [kind, model] of Object.entries(models))
      model.deltaDecorations([], coverageDecorations(resource.coverage[kind], model.getLineCount()));
    const story = createArchitectureStory(resource, scenes);
    story.panel.className = 'visual-panel svg-illustration code-metrics';
    const container = story.panel.querySelector('.metrics-editor');
    const editor = monaco.editor.create(container, {
      readOnly: true, domReadOnly: true, automaticLayout: true,
      minimap: { enabled: false }, wordWrap: 'off',
      fontSize: 21, lineHeight: 25, padding: { top: 16, bottom: 16 },
      fontFamily: '"SFMono-Regular", Consolas, monospace',
      lineNumbers: 'off', folding: false, glyphMargin: false,
      lineDecorationsWidth: 10,
      scrollBeyondLastLine: false, renderValidationDecorations: 'off',
      renderLineHighlight: 'none', overviewRulerLanes: 0,
      stickyScroll: { enabled: false }, ariaLabel: 'CRAP index code example',
    });
    return {
      ...story,
      show(step, options) {
        story.show(step, options);
        container.inert = !models[step.scene];
        if (!models[step.scene]) return;
        editor.setModel(models[step.scene]);
        editor.setScrollTop(0);
        editor.layout();
      },
      dispose() {
        editor.dispose();
        Object.values(models).forEach((model) => model.dispose());
        story.dispose();
      },
    };
  },
};
