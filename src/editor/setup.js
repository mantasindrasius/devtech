import { defineEditorThemes } from '../theme/editor-themes.js';
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
export { monaco };

export function setupEditor(element) {
  self.MonacoEnvironment = {
    getWorker: (_, label) =>
      ['typescript', 'javascript'].includes(label) ? new tsWorker() : new editorWorker(),
  };
  defineEditorThemes(monaco);
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    strict: true,
  });
  return monaco.editor.create(element, {
    model: null,
    theme: 'talk-dark',
    fontFamily: '"SFMono-Regular", Consolas, monospace',
    fontSize: 14,
    lineHeight: 25,
    padding: { top: 20, bottom: 20 },
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    renderLineHighlight: 'none',
    lineNumbersMinChars: 3,
    folding: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    scrollbar: { verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
    wordWrap: 'on',
    tabSize: 2,
    stickyScroll: { enabled: false },
  });
}
