import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aPresentation } from './support/presentation-driver.js';
import { aDeck } from './support/deck-builder.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());

test('answers the question before revealing each supporting point', async () => {
  const slide = deck.slides.find(({ id }) => id === 'read-code-less');
  const presentation = aPresentation().withSteps(slide.steps);
  await presentation.mount();

  await presentation.next();
  await presentation.next();
  await presentation.next();
  await presentation.next();
  await presentation.next();
  await presentation.replay();

  expect(presentation.observations().shown).toEqual([
    'intro', 'depends', 'yes', 'design', 'limits', 'focus', 'intro',
  ]);
  presentation.dispose();
});

test('rejects a step outside its resource-defined sequence', () => {
  const source = aDeck()
    .withResource('sequence', {
      type: 'svg-sequence', file: 'example.svg', title: 'Example',
      description: 'Custom sequence', scenes: ['first', 'second'],
    })
    .withAsset('example.svg', '<svg/>')
    .withSteps([{ id: 'bad', label: 'Bad', panel: 'sequence', scene: 'missing', caption: 'Bad' }]);

  expect(() => source.load()).toThrow('Unknown SVG scene: missing');
});
