import { expect, test } from 'bun:test';
import { aDeck } from './support/deck-builder.js';

test('loads a chapter divider without requiring a custom panel resource', () => {
  const source = aDeck().withLayout('chapter');

  const deck = source.load();

  expect(deck.slides[0].layout).toBe('chapter');
  expect(deck.slides[0].steps).toHaveLength(1);
});

test('rejects an unsupported slide layout', () => {
  const source = aDeck().withLayout('unknown');

  expect(() => source.load()).toThrow('layout must be standard, visual or chapter');
});

test('loads code from the file referenced by YAML', () => {
  const source = aDeck().withAsset('snippets/example.ts', 'const amount = 7;');

  const deck = source.load();

  expect(deck.resources.sample.source).toBe('const amount = 7;');
  expect(deck.slides[0].code).toBe('sample');
});

test('loads a referenced Mermaid diagram as its original source', () => {
  const source = aDeck()
    .withResource('architecture', {
      type: 'mermaid',
      file: 'diagrams/example.mmd',
      title: 'Architecture',
      description: 'A calls B',
    })
    .withAsset('diagrams/example.mmd', 'flowchart LR\n A --> B')
    .withSteps([{ id: 'diagram', label: 'Architecture', panel: 'architecture' }]);

  const deck = source.load();

  expect(deck.resources.architecture.source).toBe('flowchart LR\n A --> B');
});

test('rejects a missing snippet with the referenced filename', () => {
  const source = aDeck().withoutAsset('snippets/example.ts');

  expect(() => source.load()).toThrow('Missing resource file: snippets/example.ts');
});

test.each(['../secret.ts', '/secret.ts', 'https://example.com/code.ts', 'snippets/../secret.ts'])(
  'rejects a resource outside the content directory: %s',
  (file) => {
    const source = aDeck().withResourcePath(file);

    expect(() => source.load()).toThrow('Resource path must be relative');
  },
);

test('rejects duplicate slide IDs', () => {
  const source = aDeck().withDuplicateSlide();

  expect(() => source.load()).toThrow('Duplicate slides id: example');
});

test('rejects unknown action kinds before starting the presentation', () => {
  const source = aDeck().withSteps([{ id: 'new', label: 'New', actions: [{ type: 'unknown' }] }]);

  expect(() => source.load()).toThrow('Unknown step action: unknown');
});

test('rejects an unknown diagram reference', () => {
  const source = aDeck().withSteps([{ id: 'diagram', label: 'Diagram', panel: 'missing' }]);

  expect(() => source.load()).toThrow('Unknown panel resource: missing');
});

test('rejects an unknown scene in a stacked project illustration', () => {
  const source = aDeck()
    .withResource('project', {
      type: 'stacked-project',
      file: 'illustrations/project.svg',
      title: 'A project under strain',
      description: 'A stack of software features',
    })
    .withAsset('illustrations/project.svg', '<svg></svg>')
    .withSteps([
      {
        id: 'collapse',
        label: 'Collapse',
        panel: 'project',
        scene: 'unknown',
        caption: 'It breaks.',
      },
    ]);

  expect(() => source.load()).toThrow('Unknown stacked-project scene: unknown');
});

test('rejects an unknown scene in the spaceship illustration', () => {
  const source = aDeck()
    .withResource('ship', {
      type: 'spaceship-project',
      file: 'illustrations/ship.svg',
      title: 'Building in AI era',
      description: 'A spaceship under construction',
    })
    .withAsset('illustrations/ship.svg', '<svg></svg>')
    .withSteps([
      {
        id: 'unknown',
        label: 'Unknown',
        panel: 'ship',
        scene: 'unknown',
        caption: 'Unknown scene.',
      },
    ]);

  expect(() => source.load()).toThrow('Unknown spaceship scene: unknown');
});

test('rejects invalid typing timing', () => {
  const source = aDeck().withSteps([
    {
      id: 'edit',
      label: 'Edit',
      actions: [{ type: 'type-edit', find: '42', replacement: '0', typingDelayMs: -1 }],
    },
  ]);

  expect(() => source.load()).toThrow('Invalid typingDelayMs');
});
