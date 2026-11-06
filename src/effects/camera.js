export function createCamera({ editor, panel, canvas, reducedMotion }) {
  let animation;
  const reset = () => {
    animation?.cancel();
    animation = null;
    canvas.classList.remove('code-closeup');
  };
  window.addEventListener('resize', reset);
  return {
    async focus(position, signal) {
      reset();
      if (reducedMotion()) return;
      const target = calculateTransform(editor, panel, canvas, position);
      if (!target) return;
      canvas.classList.add('code-closeup');
      animation = panel.animate([{ transform: 'none' }, { transform: target }], {
        duration: 850,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both',
      });
      await observeAnimation(animation, signal);
    },
    async restore(signal) {
      if (!animation) return;
      canvas.classList.remove('code-closeup');
      animation.reverse();
      await observeAnimation(animation, signal);
      reset();
    },
    reset,
    dispose() {
      reset();
      window.removeEventListener('resize', reset);
    },
  };
}

function calculateTransform(editor, panel, canvas, position) {
  const stage = canvas.getBoundingClientRect();
  const frame = panel.getBoundingClientRect();
  const editorRect = editor.getDomNode().getBoundingClientRect();
  const caret = editor.getScrolledVisiblePosition(position);
  if (!caret) return null;
  const scale = Math.min(2.1, Math.max(1.25, stage.width / 600));
  const focusX = editorRect.left - frame.left + caret.left + 40;
  const focusY = editorRect.top - frame.top + caret.top + caret.height / 2;
  const x = stage.left + stage.width / 2 - frame.left - focusX * scale;
  const y =
    stage.top +
    Math.min(stage.height, innerHeight - stage.top - 80) * 0.43 -
    frame.top -
    focusY * scale;
  return `translate(${x}px, ${y}px) scale(${scale})`;
}

async function observeAnimation(animation, signal) {
  signal.throwIfAborted();
  const cancel = () => animation.cancel();
  signal.addEventListener('abort', cancel, { once: true });
  try {
    await animation.finished;
  } catch (error) {
    if (signal.aborted) throw signal.reason;
    if (error.name !== 'AbortError') throw error;
  } finally {
    signal.removeEventListener('abort', cancel);
  }
}
