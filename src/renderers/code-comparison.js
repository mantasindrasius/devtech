import { createImplementationFace } from './implementation-face.js';
import { requireText } from '../content/validation.js';
import { bindEditorTypography } from '../editor/typography.js';

export const codeComparisonRenderer = {
  validate(resource) {
    for (const key of ['title', 'right'])
      requireText(resource[key], `code-comparison.${key}`);
    for (const key of ['leftTitle', 'rightTitle', 'takeaway'])
      if (resource[key] !== undefined) requireText(resource[key], `code-comparison.${key}`);
    const hasBacks = resource.leftImplementation !== undefined || resource.rightImplementation !== undefined;
    if (!hasBacks) return;
    for (const side of ['leftImplementation', 'rightImplementation']) {
      const description = resource[side];
      for (const key of ['interface', 'caption']) requireText(description?.[key], `${side}.${key}`);
      if (!Array.isArray(description.parts) || !description.parts.length)
        throw new Error(`${side}.parts must be a non-empty list`);
      description.parts.forEach((part) => requireText(part, `${side}.part`));
    }
  },
  validateStep(step) {
    if (!['interface', 'implementation'].includes(step.face))
      throw new Error(`Unknown comparison face: ${step.face}`);
    if (step.revealRight !== undefined && typeof step.revealRight !== 'boolean')
      throw new Error('revealRight must be a boolean');
  },
  create(resource, { monaco, resources }) {
    const right = resources[resource.right];
    if (right?.type !== 'code') throw new Error(`Unknown comparison code: ${resource.right}`);
    const panel = document.createElement('section');
    panel.className = 'visual-panel code-comparison';
    panel.dataset.advanceOnClick = 'true';
    const title = document.createElement('h1');
    title.textContent = resource.title;
    const columns = document.createElement('div');
    columns.className = 'comparison-columns';
    const panes = [
      createPane(monaco, resource.leftTitle, resource.source, 'shallow', resource.leftImplementation),
      createPane(monaco, resource.rightTitle, right.source, 'deep', resource.rightImplementation),
    ];
    columns.append(...panes.map((pane) => pane.element));
    panel.append(title, columns);
    if (resource.takeaway) {
      const takeaway = document.createElement('p');
      takeaway.textContent = resource.takeaway;
      panel.append(takeaway);
    }
    return {
      panel,
      show(step, { continuing } = {}) {
        panel.dataset.animate = String(Boolean(continuing));
        panel.dataset.face = step.face;
        const rightVisible = step.revealRight !== false;
        panes[1].element.classList.toggle('comparison-pane-hidden', !rightVisible);
        panes[1].element.inert = !rightVisible;
        panes[1].element.setAttribute('aria-hidden', String(!rightVisible));
        panes.forEach((pane) => pane.showFace(step.face));
        panel.hidden = false;
        panes.forEach((pane) => pane.layout());
      },
      hide() {
        panel.hidden = true;
        panel.dataset.animate = 'false';
      },
      dispose() {
        panes.forEach((pane) => pane.dispose());
        panel.remove();
      },
    };
  },
};

function createPane(monaco, title, source, kind, implementation) {
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
