/** Project authored content into the ordered slides available for presentation. */
export function visibleDeck(deck) {
  const slides = deck.slides.filter((slide) => !slide.hidden);
  if (!slides.length) throw new Error('The deck must contain at least one visible slide');
  return { ...deck, slides };
}
