import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aDeck } from './support/deck-builder.js';
import { aPresentation } from './support/presentation-driver.js';

const authoredDeck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const eras = authoredDeck.slides.filter((slide) => slide.id.startsWith('software-worlds'));

test('navigates separate software-era slides and replays the current era', async () => {
  const presentation = aPresentation().withSlides(eras);
  await presentation.mount();
  expect(presentation.observations().shown).toEqual(['title']);

  await presentation.next();
  await presentation.next();
  await presentation.next();
  await presentation.previous();
  await presentation.replay();

  expect(presentation.observations().shown).toEqual([
    'title',
    'monolith',
    'microservices',
    'ai-era',
    'microservices',
    'microservices',
  ]);
  expect(eras.map((slide) => slide.steps.length)).toEqual([2, 1, 1]);
  expect(presentation.observations().errors).toEqual([]);
  presentation.dispose();
});

test('rejects an unknown era in planet slide content', () => {
  const source = aDeck()
    .withResource('worlds', authoredDeck.resources['planet-evolution'])
    .withAsset('illustrations/planet-evolution.svg', '<svg/>')
    .withSteps([
      { id: 'unknown', label: 'Unknown', panel: 'worlds', scene: 'unknown', caption: 'Unknown' },
    ]);

  expect(() => source.load()).toThrow('Unknown planet evolution scene: unknown');
});
