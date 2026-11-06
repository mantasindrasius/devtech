export function createCheckRunner({ monaco, editor, output, button }) {
  let active;
  function clear() {
    active?.abort();
    active = null;
    output.hidden = true;
    button.disabled = false;
  }
  return {
    clear,
    async run(parentSignal) {
      clear();
      const controller = new AbortController();
      active = controller;
      const cancel = () => controller.abort();
      parentSignal?.addEventListener('abort', cancel, { once: true });
      if (parentSignal?.aborted) controller.abort();
      output.hidden = false;
      output.className = '';
      output.textContent = 'Running checks…';
      button.disabled = true;
      try {
        const javascript = await compile(monaco, editor.getModel());
        controller.signal.throwIfAborted();
        await execute(javascript, controller.signal);
        if (active === controller)
          report('success', '✓ Example completed without assertion errors');
      } catch (error) {
        if (!controller.signal.aborted && active === controller)
          report('failure', `✕ ${error.message}`);
      } finally {
        parentSignal?.removeEventListener('abort', cancel);
        if (active === controller) button.disabled = false;
      }
    },
    dispose: clear,
  };
  function report(className, message) {
    output.className = className;
    output.textContent = message;
  }
}

async function compile(monaco, model) {
  if (model.getLanguageId() === 'javascript') return model.getValue();
  const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
  const client = await getWorker(model.uri);
  const result = await client.getEmitOutput(model.uri.toString());
  const code = result.outputFiles.find((file) => file.name.endsWith('.js'))?.text;
  if (!code) throw new Error('Could not compile the example.');
  return code;
}

function execute(code, signal) {
  const url = URL.createObjectURL(
    new Blob([code + '\npostMessage({ok:true});'], { type: 'text/javascript' }),
  );
  const worker = new Worker(url, { type: 'module' });
  return new Promise((resolve, reject) => {
    const finish = (error) => {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      worker.terminate();
      URL.revokeObjectURL(url);
      error ? reject(error) : resolve();
    };
    const abort = () => finish(signal.reason);
    const timer = setTimeout(() => finish(new Error('Checks timed out after 3 seconds.')), 3000);
    worker.onmessage = () => finish();
    worker.onerror = (event) => finish(new Error(event.message));
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
  });
}
