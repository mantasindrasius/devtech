function isText(element) {
  if (element.closest('.monaco-editor, #editor, style, script')) return false;
  if (element.namespaceURI === 'http://www.w3.org/2000/svg')
    return element.tagName === 'text' || (element.tagName === 'tspan' &&
      (element.hasAttribute('font-size') || element.style.fontSize));
  return [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim());
}

/** Preserve authored sizes, including SVG attributes and responsive CSS. */
export function bindSlideScale(slide, preference) {
  const originals = new Map();
  let frame;
  function restore() {
    originals.forEach((original, element) => {
      if (original.value) element.style.setProperty('font-size', original.value, original.priority);
      else element.style.removeProperty('font-size');
    });
  }
  function update() {
    frame = undefined;
    restore();
    for (const element of originals.keys())
      if (!slide.contains(element)) originals.delete(element);
    const elements = [...slide.querySelectorAll('*')].filter(isText);
    const sizes = elements.map((element) => parseFloat(getComputedStyle(element).fontSize));
    const scale = preference.current().slides;
    elements.forEach((element, index) => {
      if (!originals.has(element)) originals.set(element, {
        value: element.style.getPropertyValue('font-size'),
        priority: element.style.getPropertyPriority('font-size'),
      });
      if (scale !== 1) element.style.fontSize = `${sizes[index] * scale}px`;
    });
  }
  const schedule = () => { if (frame === undefined) frame = requestAnimationFrame(update); };
  const content = new MutationObserver((records) => {
    if (records.some((record) => !record.target.closest?.('.monaco-editor') &&
      [...record.addedNodes].some((node) => node.nodeType === 1 || !originals.has(record.target)))) schedule();
  });
  content.observe(slide, { childList: true, subtree: true });
  const layout = new MutationObserver(schedule);
  layout.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  const unsubscribe = preference.subscribe(schedule);
  window.addEventListener('resize', schedule);
  schedule();
  return () => {
    unsubscribe();
    content.disconnect();
    layout.disconnect();
    window.removeEventListener('resize', schedule);
    cancelAnimationFrame(frame);
    restore();
  };
}
