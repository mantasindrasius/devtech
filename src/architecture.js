export const architectureSource = `flowchart TB
  api["HTTP API / controller"] -->|calls| usecase["placeOrder · business rules"]
  subgraph domain["Domain · local reasoning boundary"]
    usecase -->|depends on| port["OrderStore · interface"]
  end
  adapter["SQL order adapter"] -.->|implements| port
  adapter -->|writes| database[("Orders database")]
  tests["In-memory test adapter"] -.->|implements| port
`;

export function createArchitecture() {
  const panel = document.createElement('section');
  panel.className = 'architecture-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Order service architecture');
  panel.innerHTML = `<div class="code-toolbar"><span>◇ &nbsp; order-service.mmd</span><button class="diagram-source-toggle" aria-expanded="false">Mermaid source</button></div>
    <div class="architecture-render" role="img" aria-label="The HTTP API calls placeOrder. The domain use case depends on the OrderStore interface. SQL and in-memory test adapters implement that interface. The SQL adapter writes to the orders database.">
      <div class="architecture-fallback">
        <div class="architecture-node">HTTP API / controller</div><div class="architecture-arrow">↓ calls</div>
        <div class="architecture-domain"><small>DOMAIN · LOCAL REASONING BOUNDARY</small><div class="architecture-node">placeOrder · business rules</div><div class="architecture-arrow">↓ depends on</div><div class="architecture-node contract">OrderStore · interface</div></div>
        <div class="architecture-adapters"><div><div class="architecture-arrow">↑ implements</div><div class="architecture-node">SQL order adapter</div><div class="architecture-arrow">↓ writes</div><div class="architecture-node">Orders database</div></div><div><div class="architecture-arrow">↑ implements</div><div class="architecture-node">In-memory test adapter</div></div></div>
      </div>
    </div><pre class="architecture-source" hidden></pre>
    <p class="architecture-caption">Dependencies point toward the contract.<br>Swap the adapter; keep the business rules.</p>
    <div class="code-footer"><span class="diagram-render-status">Local diagram · loading Mermaid…</span><span>Example architecture</span></div>`;
  panel.querySelector('pre').textContent = architectureSource;
  const toggle = panel.querySelector('button');
  toggle.onclick = () => {
    const source = panel.querySelector('pre');
    source.hidden = !source.hidden;
    panel.querySelector('.architecture-render').hidden = !source.hidden;
    toggle.textContent = source.hidden ? 'Mermaid source' : 'Show diagram';
    toggle.setAttribute('aria-expanded', String(!source.hidden));
  };
  let loading;
  async function render() {
    // Lazy load only when this beat is shown; local fallback stays available.
    try {
      const { default: mermaid } = await import('mermaid');
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base',
        themeVariables: { background: '#15191f', primaryColor: '#263329', primaryTextColor: '#e8ecf0', primaryBorderColor: '#7ea66b', lineColor: '#99adbd', secondaryColor: '#202a36', tertiaryColor: '#15191f', clusterBkg: '#1b241d', clusterBorder: '#506948', fontFamily: 'DM Sans, sans-serif', fontSize: '15px' },
        flowchart: { htmlLabels: false, curve: 'basis', padding: 16 },
      });
      const result = await mermaid.render('order-architecture-svg', architectureSource);
      panel.querySelector('.architecture-render').innerHTML = result.svg;
      panel.querySelector('.diagram-render-status').textContent = 'Rendered with Mermaid';
    } catch {
      panel.querySelector('.diagram-render-status').textContent = 'Local fallback · Mermaid unavailable';
    }
  }
  return { panel, show(visible) { panel.hidden = !visible; if (visible && !loading) loading = render(); } };
}
