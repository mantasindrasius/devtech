import { createCodeAdapter } from '../../src/editor/code-adapter.js';
import { createModelStore } from '../../src/editor/model-store.js';

class Range {
  constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
    Object.assign(this, { startLineNumber, startColumn, endLineNumber, endColumn });
  }
}

function aModel(source, language, uri) {
  let value = source;
  const listeners = new Set();
  return {
    uri,
    getValue: () => value,
    setValue(text) {
      value = text;
      listeners.forEach((listener) => listener());
    },
    getLanguageId: () => language,
    getPositionAt: (offset) => ({ lineNumber: 1, column: offset + 1 }),
    onDidChangeContent(listener) {
      listeners.add(listener);
      return { dispose: () => listeners.delete(listener) };
    },
    dispose() {
      listeners.clear();
    },
  };
}

export function anEditor() {
  const storage = new Map();
  const monaco = {
    Range,
    Uri: { parse: (path) => ({ path }) },
    editor: { createModel: aModel, ScrollType: { Immediate: 1 } },
  };
  const deck = {
    id: 'demo',
    resources: {
      sample: {
        id: 'sample',
        type: 'code',
        file: 'sample.ts',
        language: 'typescript',
        source: 'total > 0',
      },
    },
    slides: [{ code: 'sample' }],
  };
  let model;
  const editor = {
    getModel: () => model,
    setModel: (value) => {
      model = value;
    },
    updateOptions() {},
    setPosition() {},
    revealLineInCenter() {},
    createDecorationsCollection: () => ({ set() {}, clear() {} }),
  };
  const models = createModelStore(monaco, deck, {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  });
  const adapter = createCodeAdapter({
    monaco,
    editor,
    models,
    panel: { classList: { add() {}, remove() {} } },
  });
  adapter.show('sample');
  return {
    withUserCode(text) {
      editor.getModel().setValue(text);
      return this;
    },
    suggest: (find, replacement) => adapter.beginEdit(find, replacement),
    visibleCode: () => editor.getModel().getValue(),
    savedCode: () => storage.get('demo:code:sample'),
    dispose: () => models.dispose(),
  };
}
