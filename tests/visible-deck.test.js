import { expect, test } from 'bun:test';
import { visibleDeck } from '../src/content/visible-deck.js';

test('excludes hidden slides while preserving visible slide order and authored content', () => {
  const slides = [
    { id: 'hidden-opening', hidden: true },
    { id: 'opening' },
    { id: 'animation', hidden: true },
    { id: 'chapter', hidden: false },
    { id: 'hidden-ending', hidden: true },
  ];
  const authored = { id: 'talk', resources: {}, slides };

  const presentation = visibleDeck(authored);

  expect(presentation.slides.map((slide) => slide.id)).toEqual(['opening', 'chapter']);
  expect(authored.slides).toHaveLength(5);
  expect(presentation.resources).toBe(authored.resources);
});

test('rejects a presentation without visible slides', () => {
  const authored = { slides: [{ id: 'animation', hidden: true }] };

  expect(() => visibleDeck(authored)).toThrow('at least one visible slide');
});
