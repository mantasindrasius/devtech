export function createTypingStep(options, context) {
  let edit;
  return {
    async run({ signal, animate }) {
      signal.throwIfAborted();
      edit = context.code.beginEdit(options.find, options.replacement);
      if (!animate || context.reducedMotion()) {
        edit.replace(options.replacement);
        return;
      }
      await playEdit(edit, options, context, signal);
    },
    dispose() {
      context.camera.reset();
      edit?.dispose();
      edit = null;
    },
  };
}

async function playEdit(edit, options, context, signal) {
  edit.markRemoval();
  if (options.zoom) await context.camera.focus(edit.position, signal);
  await context.wait(100, signal);
  edit.replace('');
  let inserted = '';
  for (const character of options.replacement) {
    signal.throwIfAborted();
    inserted += character;
    edit.replace(inserted);
    await context.wait(options.typingDelayMs ?? 100, signal);
  }
  await context.wait(options.holdMs ?? 700, signal);
  if (options.zoom) await context.camera.restore(signal);
  edit.finish();
}
