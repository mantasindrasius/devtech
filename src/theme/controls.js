export function bindTheme({ preference, control, monaco, root }) {
  const buttons = [...control.querySelectorAll('[data-theme]')];
  const apply = (theme) => {
    root.dataset.theme = theme;
    buttons.forEach((button) =>
      button.setAttribute('aria-pressed', String(button.dataset.theme === theme)),
    );
    monaco.editor.setTheme(`talk-${theme}`);
  };
  apply(preference.current());
  const unsubscribe = preference.subscribe(apply);
  const onClick = (event) => {
    const button = event.target.closest('button[data-theme]');
    if (button && control.contains(button)) preference.select(button.dataset.theme);
  };
  control.addEventListener('click', onClick);
  return () => {
    unsubscribe();
    control.removeEventListener('click', onClick);
  };
}
