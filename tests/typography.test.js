import { expect, test } from 'bun:test';
import { createTypographyPreference } from '../src/typography/preference.js';
import { scaleEditor } from '../src/typography/editor-scale.js';

function aStorage(initial = null) {
  let saved = initial;
  return { getItem: () => saved, setItem: (_, value) => { saved = value; } };
}

function anEditor(fontSize = 20, lineHeight = 28) {
  let values = { fontSize, lineHeight };
  const listeners = new Set();
  return {
    getOption: (key) => values[key],
    updateOptions(next) {
      const changed = Object.keys(next).filter((key) => next[key] !== values[key]);
      values = { ...values, ...next };
      listeners.forEach((listener) => listener({ hasChanged: (key) => changed.includes(key) }));
    },
    onDidChangeConfiguration(listener) {
      listeners.add(listener);
      return { dispose: () => listeners.delete(listener) };
    },
    layout() {},
    sizes: () => values,
  };
}
const options = { fontSize: 'fontSize', lineHeight: 'lineHeight' };

test('font controls start at the current sizes and persist independent selections', () => {
  const storage = aStorage();
  const preference = createTypographyPreference(storage);
  expect(preference.current()).toEqual({ slides: 1, code: 1 });

  preference.select('slides', 1.25);
  preference.select('code', 0.9);

  expect(createTypographyPreference(storage).current()).toEqual({ slides: 1.25, code: 0.9 });
});

test('invalid saved scales fall back to the baseline and unavailable storage is optional', () => {
  const preference = createTypographyPreference(aStorage('{"slides":99,"code":1.25}'));
  expect(preference.current()).toEqual({ slides: 1, code: 1.25 });
  const unavailable = createTypographyPreference({
    getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); },
  });
  unavailable.select('code', 1.5);
  expect(unavailable.current().code).toBe(1.5);
});

test('changing editor scale repeatedly does not compound and baseline restores exactly', () => {
  const preference = createTypographyPreference(aStorage());
  const editor = anEditor();
  const dispose = scaleEditor(editor, options, preference);

  preference.select('code', 1.25);
  expect(editor.sizes()).toEqual({ fontSize: 25, lineHeight: 35 });
  preference.select('slides', 1.5);
  expect(editor.sizes()).toEqual({ fontSize: 25, lineHeight: 35 });
  preference.select('code', 0.75);
  expect(editor.sizes()).toEqual({ fontSize: 15, lineHeight: 21 });
  preference.select('code', 1);
  expect(editor.sizes()).toEqual({ fontSize: 20, lineHeight: 28 });
  dispose();
});

test('responsive editor sizing becomes the new baseline and cleanup stops updates', () => {
  const preference = createTypographyPreference(aStorage());
  preference.select('code', 1.5);
  const editor = anEditor();
  const dispose = scaleEditor(editor, options, preference);

  editor.updateOptions({ fontSize: 24, lineHeight: 32 });
  expect(editor.sizes()).toEqual({ fontSize: 36, lineHeight: 48 });
  preference.select('code', 1);
  expect(editor.sizes()).toEqual({ fontSize: 24, lineHeight: 32 });
  dispose();
  preference.select('code', 1.25);
  expect(editor.sizes()).toEqual({ fontSize: 24, lineHeight: 32 });
});
