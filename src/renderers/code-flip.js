import { requireText } from '../content/validation.js';
import { createCodePane } from './code-pane.js';

export const codeFlipRenderer = {
  validate(resource) {
    for (const key of ['title', 'right', 'leftTitle', 'rightTitle'])
      requireText(resource[key], `code-flip.${key}`);
  },
  validateStep(step) {
    if (!['front', 'back'].includes(step.face))
      throw new Error(`Unknown code flip face: ${step.face}`);
  },
  create(resource, { monaco, resources }) {
    const right = resources[resource.right];
    if (right?.type !== 'code') throw new Error(`Unknown flip code: ${resource.right}`);
    const panel = document.createElement('section');
    panel.className = 'visual-panel code-comparison code-flip';
    panel.dataset.advanceOnClick = 'true';
    const title = document.createElement('h1');
    title.textContent = resource.title;
    const stage = document.createElement('div');
    stage.className = 'code-flip-stage';
    const turner = document.createElement('div');
    turner.className = 'code-flip-turner';
    const panes = [
      createCodePane(monaco, resource.leftTitle, resource.source, 'server'),
      createCodePane(monaco, resource.rightTitle, right.source, 'client'),
    ];
    panes.forEach((pane, index) => {
      pane.element.classList.add('code-flip-face');
      pane.element.dataset.side = index === 0 ? 'front' : 'back';
      turner.append(pane.element);
    });
    stage.append(turner);
    panel.append(title, stage);
    return {
      panel,
      show(step, { continuing } = {}) {
        panel.dataset.animate = String(Boolean(continuing));
        panel.dataset.side = step.face;
        panel.hidden = false;
        panes.forEach((pane) => {
          const active = pane.element.dataset.side === step.face;
          pane.element.inert = !active;
          pane.element.setAttribute('aria-hidden', String(!active));
          pane.layout();
        });
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
