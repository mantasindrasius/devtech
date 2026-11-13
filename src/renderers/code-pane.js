import { createImplementationFace } from './implementation-face.js';
import { bindEditorTypography } from '../editor/typography.js';

export function createCodePane(monaco, title, source, kind, implementation) {
  const element = document.createElement('section');
  element.className = `comparison-pane ${kind}`;
  if (title) {
    const heading = document.createElement('h2');
    heading.textContent = title;
    element.append(heading);
  }
  const container = document.createElement('div');
  container.className = 'comparison-editor';
  const card = document.createElement('div');
  card.className = 'comparison-card';
  const turner = document.createElement('div');
  turner.className = 'comparison-turner';
  const front = document.createElement('div');
  front.className = 'comparison-front';
  front.append(container);
  const back = implementation ? createImplementationFace(implementation) : null;
  turner.append(front);
  if (back) turner.append(back);
  card.append(turner);
  element.append(card);
  const model = monaco.editor.createModel(source, 'typescript');
  const editor = monaco.editor.create(container, {
    model, readOnly: true, domReadOnly: true,
    automaticLayout: true, minimap: { enabled: false },
    scrollBeyondLastLine: false, renderValidationDecorations: 'off',
    lineNumbers: 'off', folding: false, glyphMargin: false,
    renderLineHighlight: 'none', overviewRulerLanes: 0,
    wordWrap: 'off', stickyScroll: { enabled: false },
    fontFamily: '"SFMono-Regular", Consolas, monospace',
    ariaLabel: title ?? `${kind} module interface`,
  });
  let unbindTypography;
  return {
    element,
    showFace(face) {
      const flipped = face === 'implementation';
      front.inert = flipped;
      if (back) back.inert = !flipped;
      front.setAttribute('aria-hidden', String(flipped));
      back?.setAttribute('aria-hidden', String(!flipped));
    },
    layout() {
      unbindTypography ??= bindEditorTypography(editor, container);
      editor.layout();
    },
    dispose() {
      unbindTypography?.();
      editor.dispose();
      model.dispose();
    },
  };
}
