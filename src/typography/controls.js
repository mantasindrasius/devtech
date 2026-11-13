import { fontScales } from './preference.js';

export function bindTypographyControls(control, preference) {
  for (const [key, label] of [['slides', 'Text'], ['code', 'Code']]) {
    const field = document.createElement('label');
    field.textContent = label;
    const select = document.createElement('select');
    select.dataset.fontScale = key;
    select.setAttribute('aria-label', key === 'slides' ? 'Slide font scale' : 'Monaco font scale');
    for (const scale of fontScales) {
      const option = document.createElement('option');
      option.value = String(scale);
      option.textContent = `${Math.round(scale * 100)}%`;
      select.append(option);
    }
    field.append(select);
    control.append(field);
  }
  const update = (values) => control.querySelectorAll('select').forEach((select) => {
    select.value = String(values[select.dataset.fontScale]);
  });
  const change = (event) => {
    const key = event.target.dataset.fontScale;
    if (key) preference.select(key, Number(event.target.value));
  };
  update(preference.current());
  const unsubscribe = preference.subscribe(update);
  control.addEventListener('change', change);
  return () => {
    unsubscribe();
    control.removeEventListener('change', change);
    control.replaceChildren();
  };
}
