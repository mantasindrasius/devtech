/** Track authored/responsive sizes separately from the user's multiplier. */
export function scaleEditor(editor, options, preference) {
  let applying = false;
  let fontSize = editor.getOption(options.fontSize);
  let lineHeight = editor.getOption(options.lineHeight);
  const apply = () => {
    applying = true;
    try {
      const scale = preference.current().code;
      editor.updateOptions({ fontSize: fontSize * scale, lineHeight: Math.round(lineHeight * scale) });
      editor.layout();
    } finally { applying = false; }
  };
  const configuration = editor.onDidChangeConfiguration((event) => {
    if (applying) return;
    const fontChanged = event.hasChanged(options.fontSize);
    const heightChanged = event.hasChanged(options.lineHeight);
    if (!fontChanged && !heightChanged) return;
    if (fontChanged) fontSize = editor.getOption(options.fontSize);
    if (heightChanged) lineHeight = editor.getOption(options.lineHeight);
    apply();
  });
  const unsubscribe = preference.subscribe(apply);
  apply();
  return () => { configuration.dispose(); unsubscribe(); };
}

export function bindMonacoScale(monaco, preference) {
  const bindings = new Map();
  function attach(editor) {
    if (bindings.has(editor)) return;
    const unbind = scaleEditor(editor, monaco.editor.EditorOption, preference);
    const disposal = editor.onDidDispose(() => {
      unbind();
      disposal.dispose();
      bindings.delete(editor);
    });
    bindings.set(editor, () => { unbind(); disposal.dispose(); });
  }
  const created = monaco.editor.onDidCreateEditor(attach);
  monaco.editor.getEditors().forEach(attach);
  return () => {
    created.dispose();
    bindings.forEach((unbind) => unbind());
    bindings.clear();
  };
}
