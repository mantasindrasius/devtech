import { requireText } from '../content/validation.js';

/** Inline, repository-authored SVGs inherit the deck's theme variables. */
export const svgIllustrationRenderer = {
  validate(resource) {
    requireText(resource.title, 'svg-illustration.title');
    requireText(resource.description, 'svg-illustration.description');
    if (!resource.file.endsWith('.svg')) throw new Error('Illustration resource must be SVG');
  },
  create(resource) {
    const panel = document.createElement('section');
    panel.className = 'visual-panel svg-illustration';
    panel.setAttribute('aria-label', resource.title);
    const art = document.createElement('div');
    art.className = 'visual-art';
    art.setAttribute('role', 'img');
    art.setAttribute('aria-label', resource.description);
    art.innerHTML = resource.source;
    panel.append(art);
    return {
      panel,
      show() {
        panel.hidden = false;
      },
      hide() {
        panel.hidden = true;
      },
      dispose() {
        panel.remove();
      },
    };
  },
};
