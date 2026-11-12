import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aDeck } from './support/deck-builder.js';
import { aPresentation } from './support/presentation-driver.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const intro = deck.slides.find((slide) => slide.id === 'deep-modules-intro');

test('opens on the topic title and settles into its points on the next click', async () => {
  const presentation = aPresentation().withSteps(intro.steps);
  await presentation.mount();

  await presentation.next();
  await presentation.replay();

  expect(presentation.observations().shown).toEqual(['title', 'points', 'title']);
  expect(presentation.observations().errors).toEqual([]);
  presentation.dispose();
});

test('rejects an unknown scene in a topic intro', () => {
  const source = aDeck()
    .withResource('topic', deck.resources['deep-modules-intro'])
    .withAsset('illustrations/deep-modules-intro.svg', '<svg/>')
    .withSteps([
      { id: 'invalid', label: 'Invalid', panel: 'topic', scene: 'unknown', caption: 'Unknown' },
    ]);

  expect(() => source.load()).toThrow('Unknown topic intro scene: unknown');
});
