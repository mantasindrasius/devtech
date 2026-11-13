import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aPresentation } from './support/presentation-driver.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const slide = deck.slides.find(({ id }) => id === 'testing-shape');

test('reveals trade-offs before reshaping and parallelizing the test suite', async () => {
  const presentation = aPresentation().withSteps(slide.steps);
  await presentation.mount();

  for (let click = 0; click < 11; click++) await presentation.next();
  await presentation.previous();
  await presentation.replay();

  expect(presentation.observations().shown).toEqual([
    'pyramid', 'e2e', 'e2e-pro', 'e2e-con', 'integration', 'integration-pro', 'integration-con', 'unit', 'unit-pro', 'unit-con', 'diamond', 'parallel', 'diamond', 'pyramid',
  ]);
  expect(presentation.observations().errors).toEqual([]);
  presentation.dispose();
});
