import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aPresentation } from './support/presentation-driver.js';
import { codeComparisonRenderer } from '../src/renderers/code-comparison.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const slide = deck.slides.find((slide) => slide.id === 'deep-modules-comparison');

test('flips the existing comparison panel and restores interfaces on replay', async () => {
  const presentation = aPresentation().withSteps(slide.steps);
  await presentation.mount();

  await presentation.next();
  await presentation.replay();

  expect(slide.steps.map(({ panel, face }) => ({ panel, face }))).toEqual([
    { panel: 'deep-modules-comparison', face: 'interface' },
    { panel: 'deep-modules-comparison', face: 'implementation' },
  ]);
  expect(presentation.observations().shown).toEqual([
    'comparison', 'implementation-depth', 'comparison',
  ]);
  presentation.dispose();
});

test('rejects an unknown comparison face', () => {
  expect(() => codeComparisonRenderer.validateStep({ face: 'unknown' }))
    .toThrow('Unknown comparison face: unknown');
});
