import { renderDiagram } from '../theme/diagram-renderer.js';

export function createMermaidPanel(resource, theme) {
  const panel = document.createElement('section');
  panel.className = 'architecture-panel';
  panel.setAttribute('aria-label', resource.title);
  panel.innerHTML = `
    <div class="code-toolbar"><span class="diagram-file"></span><button aria-expanded="false">Mermaid source</button></div>
    <div class="architecture-render" role="img"></div>
    <pre class="architecture-source" hidden></pre>
    <p class="architecture-caption"></p>
    <div class="code-footer"><span role="status">Loading Mermaid…</span></div>`;
  const source = panel.querySelector('pre');
  const diagram = panel.querySelector('.architecture-render');
  const status = panel.querySelector('[role="status"]');
  const toggle = panel.querySelector('button');
  panel.querySelector('.diagram-file').textContent = resource.file.split('/').at(-1);
  panel.querySelector('.architecture-caption').textContent = resource.caption ?? '';
  diagram.setAttribute('aria-label', resource.description);
  source.textContent = resource.source;
  toggle.onclick = () => {
    source.hidden = !source.hidden;
    diagram.hidden = !source.hidden;
    toggle.textContent = source.hidden ? 'Mermaid source' : 'Show diagram';
    toggle.setAttribute('aria-expanded', String(!source.hidden));
  };
  let disposed = false;
  let revision = 0;
  let started = false;
  const unsubscribe = theme.subscribe(() => {
    if (started) void render();
  });
  async function render() {
    const request = ++revision;
    try {
      const result = await renderDiagram(resource.source, theme.current());
      if (disposed || request !== revision) return;
      diagram.innerHTML = result.svg;
      status.textContent = 'Rendered with Mermaid';
    } catch (error) {
      if (disposed || request !== revision) return;
      source.hidden = false;
      diagram.hidden = true;
      toggle.hidden = true;
      status.textContent = `Unable to render diagram: ${error.message}`;
    }
  }
  return {
    panel,
    show() {
      panel.hidden = false;
      if (!started) {
        started = true;
        void render();
      }
    },
    hide() {
      panel.hidden = true;
    },
    dispose() {
      disposed = true;
      unsubscribe();
      panel.remove();
    },
  };
}
