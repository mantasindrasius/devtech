import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aPresentation } from './support/presentation-driver.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const slide = deck.slides.find(({ id }) => id === 'testing-shape');

test('reveals trade-offs before reshaping and parallelizing the test suite', async () => {
  const presentation = aPresentation().withSteps(slide.steps);
  await presentation.mount();

  await presentation.next();
  await presentation.next();
  await presentation.next();
  await presentation.next();
  await presentation.next();
  await presentation.previous();
  await presentation.replay();

  expect(presentation.observations().shown).toEqual([
    'pyramid', 'e2e', 'integration', 'unit', 'diamond', 'parallel', 'diamond', 'pyramid',
  ]);
  expect(presentation.observations().errors).toEqual([]);
  presentation.dispose();
});
