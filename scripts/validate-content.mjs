import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { loadDeck } from '../src/content/load-deck.js';
import { registerActions } from '../src/steps/register-actions.js';
import { registerRenderers } from '../src/renderers/register-renderers.js';

const directory = resolve('content');
const assets = Object.fromEntries(readdirSync(directory, { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile())
  .map(entry => {
    const file = resolve(entry.parentPath ?? entry.path, entry.name);
    return [relative(directory, file), readFileSync(file, 'utf8')];
  }));
const deck = loadDeck(readFileSync(resolve(directory, 'deck.yaml'), 'utf8'), {
  assets, actions: registerActions(), renderers: registerRenderers(),
});
console.log(`Validated ${deck.slides.length} slides, ${Object.keys(deck.resources).length} resources, and ${deck.slides.reduce((count, slide) => count + slide.steps.length, 0)} steps.`);
