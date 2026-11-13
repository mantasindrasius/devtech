import { requireText } from '../content/validation.js';
import { createArchitectureStory } from './architecture-story.js';
import { testScenes, testVersionPair } from './test-evolution.js';

export const idealTestRenderer = {
  validate(resource) {
    requireText(resource.title, 'ideal-test.title');
    requireText(resource.description, 'ideal-test.description');
    for (const scene of testScenes)
      requireText(resource.versions?.[scene], `ideal-test.versions.${scene}`);
    if (!resource.file.endsWith('.svg')) throw new Error('Ideal test must be SVG');
  },
  validateStep(step) {
    testVersionPair(step.scene);
    requireText(step.caption, 'ideal-test.caption');
  },
  create(resource, { monaco, resources }) {
    const snippets = testScenes.map((scene) => {
      const snippet = resources[resource.versions[scene]];
      if (snippet?.type !== 'code') throw new Error(`Unknown test code: ${resource.versions[scene]}`);
      return [scene, snippet];
    });
    const models = Object.fromEntries(snippets.map(([scene, snippet]) =>
      [scene, monaco.editor.createModel(snippet.source, snippet.language)]));
    const story = createArchitectureStory(resource, testScenes);
    story.panel.className = 'visual-panel svg-illustration ideal-test';
    const container = story.panel.querySelector('.ideal-test-editor');
    const editor = monaco.editor.createDiffEditor(container, {
      readOnly: true, domReadOnly: true, automaticLayout: true,
      renderSideBySide: false, renderIndicators: true, renderMarginRevertIcon: false,
      enableSplitViewResizing: false, diffCodeLens: false,
      minimap: { enabled: false }, wordWrap: 'off',
      fontSize: 23, lineHeight: 32, padding: { top: 20, bottom: 20 },
      fontFamily: '"SFMono-Regular", Consolas, monospace',
      lineNumbers: 'off', folding: false, glyphMargin: false,
      scrollBeyondLastLine: false, renderValidationDecorations: 'off',
      renderLineHighlight: 'none', overviewRulerLanes: 0,
      stickyScroll: { enabled: false }, ariaLabel: 'Evolving checkout test',
    });
    return {
      ...story,
      show(step, options) {
        story.show(step, options);
        const pair = testVersionPair(step.scene);
        editor.setModel({ original: models[pair.original], modified: models[pair.modified] });
        editor.getModifiedEditor().setScrollTop(0);
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
