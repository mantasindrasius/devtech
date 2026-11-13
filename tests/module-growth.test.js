import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aPresentation } from './support/presentation-driver.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const slide = deck.slides.find(({ id }) => id === 'module-growth');

test('starts with Quotes and adds a module on each advance', async () => {
  const presentation = aPresentation().withSteps(slide.steps);
  await presentation.mount();

  await presentation.next();
  await presentation.next();
  await presentation.next();
  await presentation.replay();

  expect(presentation.observations().shown).toEqual([
    'quotes', 'catalog', 'checkout', 'orders', 'quotes',
  ]);
  expect(presentation.observations().errors).toEqual([]);
  presentation.dispose();
});
