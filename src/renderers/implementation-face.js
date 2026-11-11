/** Declarative implementation diagrams used on the back of comparison cards. */
export function createImplementationFace(description) {
  const face = document.createElement('div');
  face.className = 'comparison-back';
  const entry = document.createElement('div');
  entry.className = 'implementation-entry';
  entry.textContent = description.interface;
  const internals = document.createElement('div');
  internals.className = 'implementation-internals';
  if (description.orchestration) {
    const orchestration = document.createElement('div');
    orchestration.className = 'implementation-orchestration';
    orchestration.textContent = description.orchestration;
    internals.append(orchestration);
  }
  const modules = document.createElement('div');
  modules.className = 'implementation-modules';
  for (const label of description.parts) {
    const module = document.createElement('div');
    module.className = 'implementation-module';
    module.textContent = label;
    modules.append(module);
  }
  internals.append(modules);
  const caption = document.createElement('p');
  caption.className = 'implementation-caption';
  caption.textContent = description.caption;
  face.append(entry, internals, caption);
  return face;
}
