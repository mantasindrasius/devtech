import { requireText } from '../content/validation.js';

const scenes = [
  'existing',
  'features',
  'workaround-pipe',
  'first-patch',
  'quick-fix-pipe',
  'dependencies',
  'legacy-pipe',
  'second-patch',
  'runtime-pipe',
  'todo-pipe',
  'fixme-pipe',
  'failure',
  'supported',
  'rewrite',
  'services',
  'service-rings',
  'service-links',
  'first-burst',
  'first-repair',
  'underwater-pipes',
  'second-burst',
  'second-repair',
  'sprawl',
];

export function validateStackedProjectStep(step) {
  if (!scenes.includes(step.scene)) throw new Error(`Unknown stacked-project scene: ${step.scene}`);
  requireText(step.caption, `stacked-project ${step.scene}.caption`);
}

export function createStackedProjectPanel(resource) {
  const panel = document.createElement('section');
  panel.className = 'visual-panel project-stack-panel';
  panel.setAttribute('aria-label', resource.title);
  panel.innerHTML = `
    <div class="code-toolbar"><span class="project-stack-file"></span><span class="project-stack-mode">architecture / live</span></div>
    <div class="visual-art project-stack-art" role="img"></div>
    <div class="visual-caption project-stack-caption" role="status"></div>
    <div class="code-footer"><span>SOFTWARE PROJECT</span><span>click to grow ↗</span></div>`;
  panel.querySelector('.project-stack-file').textContent = resource.file.split('/').at(-1);
  const art = panel.querySelector('.project-stack-art');
  art.setAttribute('aria-label', resource.description);
  art.innerHTML = resource.source;
  const caption = panel.querySelector('.project-stack-caption');

  return {
    panel,
    show(step, { continuing } = {}) {
      panel.dataset.animate = String(Boolean(continuing));
      const scene = scenes.indexOf(step.scene);
      for (const layer of art.querySelectorAll('[data-appears-at]')) {
        const visible =
          Number(layer.dataset.appearsAt) <= scene &&
          scene < Number(layer.dataset.disappearsAt ?? Infinity);
        layer.classList.toggle('is-visible', visible);
        layer.setAttribute('aria-hidden', String(!visible));
      }
      panel.classList.toggle('is-exploding', step.scene === 'failure');
      panel.style.setProperty('--pressure-scale', String(0.7 + Math.min(scene, 10) * 0.055));
      panel.style.setProperty('--pressure-opacity', String(0.35 + Math.min(scene, 10) * 0.06));
      panel.classList.toggle('is-supported', scene >= scenes.indexOf('supported'));
      panel.classList.toggle('is-first-burst', step.scene === 'first-burst');
      panel.classList.toggle('is-second-burst', step.scene === 'second-burst');
      panel.classList.toggle('is-first-repaired', scene >= scenes.indexOf('first-repair'));
      panel.classList.toggle('is-second-repaired', scene >= scenes.indexOf('second-repair'));
      caption.textContent = step.caption;
      panel.hidden = false;
    },
    hide() {
      panel.hidden = true;
    },
    dispose() {
      panel.remove();
    },
  };
}
