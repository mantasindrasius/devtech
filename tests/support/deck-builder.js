import { stringify } from 'yaml';
import { loadDeck } from '../../src/content/load-deck.js';
import { registerActions } from '../../src/steps/register-actions.js';
import { registerRenderers } from '../../src/renderers/register-renderers.js';

export function aDeck() {
  const document = {
    version: 1,
    id: 'test-deck',
    title: 'Example',
    presenter: { name: 'Presenter', role: 'Lead', company: 'Example', initials: 'p' },
    resources: { sample: { type: 'code', file: 'snippets/example.ts', language: 'typescript' } },
    slides: [
      {
        id: 'example',
        name: 'Example',
        label: 'EXAMPLE',
        title: [{ text: 'Example' }],
        description: 'A description',
        code: 'sample',
        takeaway: 'A conclusion',
        steps: [{ id: 'start', label: 'Start' }],
      },
    ],
  };
  const assets = { 'snippets/example.ts': 'export const total = 42;' };
  return {
    withResource(id, resource) {
      document.resources[id] = resource;
      return this;
    },
    withAsset(file, source) {
      assets[file] = source;
      return this;
    },
    withoutAsset(file) {
      delete assets[file];
      return this;
    },
    withSteps(steps) {
      document.slides[0].steps = steps;
      return this;
    },
    withLayout(layout) {
      document.slides[0].layout = layout;
      return this;
    },
    withDuplicateSlide() {
      document.slides.push(structuredClone(document.slides[0]));
      return this;
    },
    withResourcePath(file) {
      document.resources.sample.file = file;
      return this;
    },
    load() {
      return loadDeck(stringify(document), {
        assets,
        actions: registerActions(),
        renderers: registerRenderers(),
      });
    },
  };
}
