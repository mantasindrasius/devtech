export function createPanelHost({ resources, renderers, context }) {
  const instances = new Map();
  let visible;
  return {
    show(id) {
      visible?.hide();
      context.codePanel.hidden = true;
      if (!instances.has(id)) {
        const resource = resources[id];
        const instance = renderers.get(resource.type).create(resource, context);
        instances.set(id, instance);
        if (instance.panel !== context.codePanel) context.codePanel.after(instance.panel);
      }
      visible = instances.get(id);
      visible.show();
    },
    dispose() {
      instances.forEach((instance) => instance.dispose());
      instances.clear();
    },
  };
}
