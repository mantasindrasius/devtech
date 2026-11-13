import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aDeck } from './support/deck-builder.js';
import { aPresentation } from './support/presentation-driver.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const slide = deck.slides.find(({ id }) => id === 'ease-of-change');

test('flips the comparison cards to their pictures and back on replay', async () => {
  const presentation = aPresentation().withSteps(slide.steps);
  await presentation.mount();

  for (let click = 0; click < 7; click++) await presentation.next();
  await presentation.replay();

  expect(slide.steps.map(({ scene }) => scene)).toEqual([...Array(7).fill('front'), 'back']);
  expect(presentation.observations().shown).toEqual(['comparison', 'point-1', 'point-2', 'point-3', 'point-4', 'point-5', 'point-6', 'fibers', 'comparison']);
  expect(presentation.observations().errors).toEqual([]);
  presentation.dispose();
});

test('rejects an unknown face in a flip cards slide', () => {
  const source = aDeck()
    .withResource('cards', deck.resources['ease-of-change'])
    .withAsset('illustrations/ease-of-change.svg', '<svg/>')
    .withSteps([
      { id: 'invalid', label: 'Invalid', panel: 'cards', scene: 'sideways', caption: 'Unknown' },
    ]);

  expect(() => source.load()).toThrow('Unknown flip cards scene: sideways');
});
