export const fontScales = [0.75, 0.9, 1, 1.1, 1.25, 1.5];
const storageKey = 'monaco-slides:typography';

export function createTypographyPreference(storage) {
  let values = { slides: 1, code: 1 };
  const listeners = new Set();
  try {
    const saved = JSON.parse(storage.getItem(storageKey));
    for (const key of Object.keys(values))
      if (fontScales.includes(saved?.[key])) values[key] = saved[key];
  } catch { /* Storage is optional. */ }
  return {
    current: () => ({ ...values }),
    select(key, value) {
      if (!(key in values) || !fontScales.includes(value))
        throw new Error('Unknown typography setting');
      if (values[key] === value) return;
      values = { ...values, [key]: value };
      try { storage.setItem(storageKey, JSON.stringify(values)); } catch { /* Session only. */ }
      listeners.forEach((listener) => listener({ ...values }));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
