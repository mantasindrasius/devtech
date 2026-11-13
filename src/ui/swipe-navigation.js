const interactive = '.monaco-editor, a, button, input, textarea, select, [contenteditable]';

export function bindSwipeNavigation(element, previous, signal) {
  let start;
  const listen = (type, handler, passive = true) =>
    element.addEventListener(type, handler, { signal, passive });

  listen('touchstart', (event) => {
    start = undefined;
    if (event.touches.length !== 1 || event.target.closest?.(interactive)) return;
    const touch = event.touches[0];
    start = { x: touch.clientX, y: touch.clientY };
  });

  listen('touchmove', (event) => {
    if (!start) return;
    if (event.touches.length !== 1) {
      start = undefined;
      return;
    }
    const dx = event.touches[0].clientX - start.x;
    const dy = Math.abs(event.touches[0].clientY - start.y);
    if (dy > 12 && dy > Math.abs(dx)) start = undefined;
    else if (dx > 12 && dx > dy * 1.5) event.preventDefault();
  }, false);

  listen('touchend', (event) => {
    const origin = start;
    start = undefined;
    if (!origin || event.touches.length || !event.changedTouches.length) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - origin.x;
    const dy = Math.abs(touch.clientY - origin.y);
    if (dx < 60 || dx <= dy * 1.5) return;
    // Suppress the synthetic click so swiping back cannot advance again.
    event.preventDefault();
    previous();
  }, false);

  listen('touchcancel', () => { start = undefined; });
}
