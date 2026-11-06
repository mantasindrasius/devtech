/** Keep Monaco's canvas text aligned with the responsive presentation stylesheet. */
export function bindEditorTypography(editor, container) {
  const update = () => {
    const fontSize = Number.parseFloat(getComputedStyle(container).fontSize);
    editor.updateOptions({
      fontSize,
      lineHeight: Math.round(fontSize * 1.35),
      padding: { top: 12, bottom: 12 },
    });
    editor.layout();
  };
  const observer = new MutationObserver(update);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', update);
  update();
  return () => {
    observer.disconnect();
    window.removeEventListener('resize', update);
  };
}
