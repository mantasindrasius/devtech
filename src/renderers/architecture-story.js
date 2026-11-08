function revealScene(art, scene) {
  for (const layer of art.querySelectorAll('[data-appears-at]')) {
    const starts = Number(layer.dataset.appearsAt);
    const ends = Number(layer.dataset.disappearsAt ?? Infinity);
    const visible = starts <= scene && scene < ends;
    layer.classList.toggle('is-visible', visible);
    layer.setAttribute('aria-hidden', String(!visible));
  }
}

export function createArchitectureStory(resource, scenes, { prepareArt } = {}) {
  const panel = document.createElement('section');
  panel.className = 'visual-panel architecture-story spaceship-panel';
  panel.setAttribute('aria-label', resource.title);
  panel.innerHTML = `
    <div class="visual-art" role="img"></div>
    <div class="visual-caption" role="status"></div>`;
  const art = panel.querySelector('.visual-art');
  const caption = panel.querySelector('.visual-caption');
  art.setAttribute('aria-label', resource.description);
  art.innerHTML = resource.source;
  prepareArt?.(art);

  return {
    panel,
    show(step, { continuing } = {}) {
      panel.dataset.animate = String(Boolean(continuing));
      panel.dataset.scene = step.scene;
      revealScene(art, scenes.indexOf(step.scene));
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
