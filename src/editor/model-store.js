export function createModelStore(monaco, deck, storage) {
  const models = new Map();
  const listeners = [];
  for (const resource of Object.values(deck.resources).filter((item) => item.type === 'code')) {
    const key = `${deck.id}:code:${resource.id}`;
    const legacyIndex = deck.slides.findIndex((slide) => slide.code === resource.id);
    let value = resource.source;
    try {
      value = storage.getItem(key) ?? storage.getItem(`talk-slide-${legacyIndex}`) ?? value;
    } catch {
      /* Storage can be unavailable. */
    }
    const model = monaco.editor.createModel(
      value,
      resource.language,
      monaco.Uri.parse(`file:///resources/${encodeURIComponent(resource.id)}/${resource.file}`),
    );
    models.set(resource.id, model);
    listeners.push(
      model.onDidChangeContent(() => {
        try {
          storage.setItem(key, model.getValue());
        } catch {
          /* Editing remains available without persistence. */
        }
      }),
    );
  }
  return {
    get(id) {
      const model = models.get(id);
      if (!model) throw new Error(`Unknown model: ${id}`);
      return model;
    },
    reset(id) {
      models.get(id).setValue(deck.resources[id].source);
    },
    dispose() {
      listeners.forEach((listener) => listener.dispose());
      models.forEach((model) => model.dispose());
    },
  };
}
