import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aPresentation } from './support/presentation-driver.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const slide = deck.slides.find(({ id }) => id === 'change-cost');

test('reveals the target curve on advance and resets on replay', async () => {
  const presentation = aPresentation().withSteps(slide.steps);
  await presentation.mount();

  await presentation.next();
  await presentation.replay();

  expect(presentation.observations().shown).toEqual(['growing', 'goal', 'growing']);
  expect(presentation.observations().errors).toEqual([]);
  presentation.dispose();
});
