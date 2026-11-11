import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aPresentation } from './support/presentation-driver.js';
import { aDeck } from './support/deck-builder.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const workflow = deck.slides.find((slide) => slide.id === 'agent-workflow');

test('reveals one phase per click and returns to the title on replay', async () => {
  const presentation = aPresentation().withSteps(workflow.steps);
  await presentation.mount();

  await presentation.next();
  await presentation.next();
  await presentation.next();
  await presentation.previous();
  await presentation.replay();

  expect(presentation.observations().shown).toEqual([
    'intro', 'explore', 'plan', 'implement', 'plan', 'intro',
  ]);
  expect(presentation.observations().errors).toEqual([]);
  presentation.dispose();
});

test('rejects an unsupported phase before presenting the workflow', () => {
  const source = aDeck()
    .withResource('workflow', deck.resources['agent-workflow'])
    .withAsset('illustrations/agent-workflow.svg', '<svg/>')
    .withSteps([
      { id: 'invalid', label: 'Invalid', panel: 'workflow', scene: 'unknown', caption: 'Unknown' },
    ]);

  expect(() => source.load()).toThrow('Unknown workflow phase: unknown');
});
