import { expect, test } from 'bun:test';
import { createThemePreference } from '../src/theme/preference.js';

function memoryStorage(initial = null) {
  let value = initial;
  return {
    getItem: () => value,
    setItem: (_, next) => {
      value = next;
    },
  };
}

test('restores the selected light theme on the next session', () => {
  const storage = memoryStorage();
  const theme = createThemePreference(storage);

  theme.select('light');

  expect(createThemePreference(storage).current()).toBe('light');
});

test('keeps the dark default when a saved theme is unknown', () => {
  const theme = createThemePreference(memoryStorage('obsolete'));

  expect(theme.current()).toBe('dark');
});

test('notifies theme consumers and stops notifying after cleanup', () => {
  const theme = createThemePreference(memoryStorage());
  const observed = [];
  const unsubscribe = theme.subscribe((value) => observed.push(value));

  theme.select('light');
  unsubscribe();
  theme.select('dark');

  expect(observed).toEqual(['light']);
});

test('allows switching themes when browser persistence is unavailable', () => {
  const unavailable = () => {
    throw new Error('Storage disabled');
  };
  const theme = createThemePreference({ getItem: unavailable, setItem: unavailable });

  theme.select('light');

  expect(theme.current()).toBe('light');
});
