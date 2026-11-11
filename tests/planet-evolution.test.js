import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aDeck } from './support/deck-builder.js';
import { aPresentation } from './support/presentation-driver.js';

const authoredDeck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const opening = authoredDeck.slides.find((slide) => slide.id === 'software-worlds');

test('advances one software era per click and returns to the monolith on replay', async () => {
  const presentation = aPresentation().withSteps(opening.steps);
  await presentation.mount();
  expect(presentation.observations().shown).toEqual(['monolith']);

  await presentation.next();
  await presentation.next();
  await presentation.previous();
  await presentation.replay();

  expect(presentation.observations().shown).toEqual([
    'monolith',
    'microservices',
    'ai-era',
    'microservices',
    'monolith',
  ]);
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
