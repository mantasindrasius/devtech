import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aPresentation } from './support/presentation-driver.js';
import { codeMetricsRenderer } from '../src/renderers/code-metrics.js';
import { coverageDecorations } from '../src/renderers/coverage-decorations.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());

test('shows the report, low and high risk examples, then cleanup; replay resets the slide', async () => {
  const slide = deck.slides.find(({ id }) => id === 'code-metrics-rescue');
  const presentation = aPresentation().withSteps(slide.steps);
  await presentation.mount();

  for (let click = 0; click < 4; click++) await presentation.next();
  await presentation.previous();
  await presentation.replay();

  expect(slide.steps.map(({ scene }) => scene)).toEqual(['intro', 'lizard', 'low', 'high', 'cleanup']);
  expect(presentation.observations().shown).toEqual([
    'metrics', 'point-1', 'point-2', 'high-crap', 'point-3', 'high-crap', 'metrics',
  ]);
  expect(presentation.observations().errors).toEqual([]);
  presentation.dispose();
});

test('rejects a metrics scene that has no visual', () => {
  expect(() => codeMetricsRenderer.validateStep({ scene: 'missing' }))
    .toThrow('Unknown metrics scene: missing');
});

test('coverage highlights mark only the supplied lines and distinguish covered from uncovered', () => {
  const decorations = coverageDecorations([
    { line: 4, covered: true }, { line: 7, covered: false },
  ], 20);

  expect(decorations.map(({ range, options }) => [range.startLineNumber, options.className]))
    .toEqual([[4, 'metrics-coverage-covered'], [7, 'metrics-coverage-uncovered']]);
});

test('rejects coverage beyond the end of an example', () => {
  expect(() => coverageDecorations([{ line: 21, covered: false }], 20))
    .toThrow('Invalid coverage line: 21');
});
