/** The transcript window fits this many calls above its thinking indicator. */
const visibleCalls = 3;

/**
 * Adapts a `.tool-transcript` element to the transcript the tool-call player drives.
 * CSS turns the `data-state` of each call and the scroll position into motion.
 */
export function toolCallTranscript(element) {
  const cards = [...element.querySelectorAll('.tool-call')];
  const scrollTo = (calls) => element.style.setProperty('--scrolled-calls', String(calls));
  return {
    calls: cards.map(readTiming),
    clear() {
      for (const card of cards) card.dataset.state = 'queued';
      element.dataset.thinking = 'false';
    },
    think() {
      element.dataset.thinking = 'true';
    },
    begin(index) {
      element.dataset.thinking = 'false';
      cards[index].dataset.state = 'running';
      scrollTo(Math.max(0, index + 1 - visibleCalls));
    },
    finish(index) {
      cards[index].dataset.state = 'done';
    },
  };
}

function readTiming(card) {
  const thinkMs = Number(card.dataset.thinkMs);
  const runMs = Number(card.dataset.runMs);
  if (!(thinkMs >= 0) || !(runMs > 0))
    throw new Error('Tool call needs data-think-ms and a positive data-run-ms');
  return { thinkMs, runMs };
}
