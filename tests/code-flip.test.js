import { expect, test } from 'bun:test';
import { parse } from 'yaml';
import { aPresentation } from './support/presentation-driver.js';
import { codeFlipRenderer } from '../src/renderers/code-flip.js';

const deck = parse(await Bun.file(new URL('../content/deck.yaml', import.meta.url)).text());
const slide = deck.slides.find((slide) => slide.id === 'composition-roots');

test('composition starts with server code, flips to React, and returns to server on replay', async () => {
  const presentation = aPresentation().withSteps(slide.steps);
  await presentation.mount();

  await presentation.next();
  await presentation.replay();

  expect(deck.resources['composition-roots'].type).toBe('code-flip');
  expect(slide.steps.map(({ face }) => face)).toEqual(['front', 'back']);
  expect(presentation.observations().shown).toEqual(['composition', 'react-client', 'composition']);
  presentation.dispose();
});

test('code flip rejects unsupported faces', () => {
  expect(() => codeFlipRenderer.validateStep({ face: 'interface' }))
    .toThrow('Unknown code flip face');
});
