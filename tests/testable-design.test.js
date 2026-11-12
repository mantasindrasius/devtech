import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aDeck } from './support/deck-builder.js';
import { aPresentation } from './support/presentation-driver.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const slide = deck.slides.find(({ id }) => id === 'testable-design');

test('opens on the in-memory tested core and adds adapters under E2E on the next click', async () => {
  const presentation = aPresentation().withSteps(slide.steps);
  await presentation.mount();

  await presentation.next();
  await presentation.replay();

  expect(presentation.observations().shown).toEqual(['in-memory', 'end-to-end', 'in-memory']);
  expect(presentation.observations().errors).toEqual([]);
  presentation.dispose();
});

test('presents testable design right after the testing bullets', () => {
  const order = deck.slides.map(({ id }) => id);

  expect(order.indexOf('testable-design')).toBe(order.indexOf('testing-safety-net') + 1);
});

test('rejects an unknown scene in a testable design slide', () => {
  const source = aDeck()
    .withResource('design', deck.resources['testable-design'])
    .withAsset('illustrations/testable-design.svg', '<svg/>')
    .withSteps([
      { id: 'invalid', label: 'Invalid', panel: 'design', scene: 'unknown', caption: 'Unknown' },
    ]);

  expect(() => source.load()).toThrow('Unknown testable design scene: unknown');
});
