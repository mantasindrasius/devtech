const palettes = {
  dark: {
    background: '#15191f',
    primaryColor: '#263329',
    primaryTextColor: '#e8ecf0',
    primaryBorderColor: '#7ea66b',
    lineColor: '#99adbd',
    secondaryColor: '#202a36',
    tertiaryColor: '#15191f',
    clusterBkg: '#1b241d',
    clusterBorder: '#506948',
  },
  light: {
    background: '#ffffff',
    primaryColor: '#edf4e8',
    primaryTextColor: '#24312d',
    primaryBorderColor: '#648755',
    lineColor: '#53685c',
    secondaryColor: '#eaf0f7',
    tertiaryColor: '#ffffff',
    clusterBkg: '#f6f8f2',
    clusterBorder: '#9aaa90',
  },
};
let sequence = 0;
let pending = Promise.resolve();

export function renderDiagram(source, theme) {
  // Mermaid configuration is global: serialize configuration and rendering together.
  const result = pending.then(async () => {
    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      themeVariables: {
        ...palettes[theme],
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '15px',
      },
      flowchart: { htmlLabels: false, curve: 'basis', padding: 16 },
    });
    return mermaid.render(`deck-diagram-${++sequence}`, source);
  });
  pending = result.catch(() => {});
  return result;
}
