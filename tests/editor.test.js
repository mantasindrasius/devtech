import { expect, test } from 'bun:test';
import { anEditor } from './support/editor-driver.js';

test('temporary suggestions never persist over user-authored code', () => {
  const editor = anEditor().withUserCode('Number.isFinite(total) && total > 0');

  const edit = editor.suggest('total > 0', 'total >= 0');
  edit.replace('total >= 0');

  expect(editor.visibleCode()).toBe('Number.isFinite(total) && total >= 0');
  expect(editor.savedCode()).toBe('Number.isFinite(total) && total > 0');
  edit.dispose();
  editor.dispose();
});

test('disposing an edit restores the user-authored model and is repeatable', () => {
  const editor = anEditor().withUserCode('total > 0');
  const edit = editor.suggest('total > 0', 'total >= 0');
  edit.replace('total >= 0');

  edit.dispose();
  edit.dispose();

  expect(editor.visibleCode()).toBe('total > 0');
  expect(editor.savedCode()).toBe('total > 0');
  editor.dispose();
});

test('a missing edit target leaves the current model untouched', () => {
  const editor = anEditor().withUserCode('total === 42');

  expect(() => editor.suggest('total > 0', 'total >= 0')).toThrow('Edit target not found');

  expect(editor.visibleCode()).toBe('total === 42');
  editor.dispose();
});
