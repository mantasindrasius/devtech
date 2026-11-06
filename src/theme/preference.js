const storageKey = 'monaco-slides:theme';
const themes = new Set(['dark', 'light']);

export function createThemePreference(storage) {
  let current = 'dark';
  const listeners = new Set();
  try {
    const saved = storage.getItem(storageKey);
    if (themes.has(saved)) current = saved;
  } catch {
    // Theme selection still works when storage is unavailable.
  }
  return {
    current: () => current,
    select(theme) {
      if (!themes.has(theme)) throw new Error(`Unknown theme: ${theme}`);
      if (theme === current) return;
      current = theme;
      try {
        storage.setItem(storageKey, theme);
      } catch {
        // Persistence is optional; keep the selected theme for this session.
      }
      listeners.forEach((listener) => listener(theme));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
