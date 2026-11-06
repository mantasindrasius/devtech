import { createArchitecture } from './architecture.js';

/** Small, replayable presentation timeline. Demo edits never touch saved models. */
export function createTransitions({ monaco, editor, models, getSlide, goToSlide, runChecks }) {
  let step = 0;
  let generation = 0;
  let demoModel = null;
  const codePanel = document.querySelector('.code-panel');
  const slideCanvas = document.getElementById('slide');
  const architecture = createArchitecture();
  codePanel.after(architecture.panel);
  let camera = null;
  function zoomOut(immediate = false) {
    slideCanvas.classList.remove('code-closeup');
    if (!camera) return;
    const previousCamera = camera;
    if (immediate) { previousCamera.cancel(); camera = null; return; }
    if (previousCamera.playbackRate < 0) return;
    previousCamera.reverse();
    previousCamera.finished.then(() => {
      previousCamera.cancel();
      if (camera === previousCamera) camera = null;
    }).catch(() => {});
  }
  function zoomToCode(position) {
    zoomOut(true);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = slideCanvas.getBoundingClientRect();
    const panel = codePanel.getBoundingClientRect();
    const editorRect = editor.getDomNode().getBoundingClientRect();
    const caret = editor.getScrolledVisiblePosition(position);
    if (!caret) return;
    const scale = Math.min(2.1, Math.max(1.25, canvas.width / 600));
    // Aim at the expression, keeping enough context on either side.
    const focusX = editorRect.left - panel.left + caret.left + 40;
    const focusY = editorRect.top - panel.top + caret.top + caret.height / 2;
    const x = canvas.left + canvas.width / 2 - panel.left - focusX * scale;
    const y = canvas.top + Math.min(canvas.height, innerHeight - canvas.top - 80) * 0.43 - panel.top - focusY * scale;
    slideCanvas.classList.add('code-closeup');
    camera = codePanel.animate([
      { transform: 'translate(0px, 0px) scale(1)' },
      { transform: `translate(${x}px, ${y}px) scale(${scale})` },
    ], { duration: 850, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' });
  }
  window.addEventListener('resize', () => zoomOut(true));
  const suggestion = editor.createDecorationsCollection();
  const replacement = 'total >= 0';
  function highlightEdit(start, length, removing = false) {
    const endColumn = start.column + length;
    const decorations = [
      { range: new monaco.Range(start.lineNumber, 1, start.lineNumber, 1), options: {
        isWholeLine: true, className: 'suggestion-line', linesDecorationsClassName: 'suggestion-gutter',
      } },
      { range: new monaco.Range(start.lineNumber, start.column, start.lineNumber, endColumn), options: {
        inlineClassName: removing ? 'suggestion-removed' : 'suggestion-inserted',
      } },
    ];
    if (!removing && length < replacement.length) {
      decorations.push({
        range: new monaco.Range(start.lineNumber, endColumn, start.lineNumber, endColumn),
        options: { after: { content: replacement.slice(length), inlineClassName: 'suggestion-ghost' } },
      });
    }
    suggestion.set(decorations);
  }
  function highlightCompletedEdit() {
    const offset = demoModel?.getValue().indexOf(replacement) ?? -1;
    if (offset >= 0) highlightEdit(demoModel.getPositionAt(offset), replacement.length);
  }
  const labels = [
    ['The premise', 'Reveal the idea', 'Meet the speaker', 'The takeaway'],
    ['The boundary', 'Explain the contract', 'Show the architecture', 'Open editor context menu', 'The takeaway'],
    ['The feedback loop', 'Explain the rule', 'Simulate a code edit', 'Run the changed example', 'The takeaway'],
  ];
  const description = document.getElementById('description');
  const author = document.getElementById('author');
  const principles = document.querySelector('.principles');
  const takeaway = document.querySelector('.takeaway');
  const status = document.createElement('span');
  status.className = 'transition-status';
  status.setAttribute('role', 'status');
  document.querySelector('.pagination').prepend(status);
  const replay = document.createElement('button');
  replay.className = 'quiet';
  replay.textContent = '↺ Replay slide';
  replay.onclick = () => reset();
  document.querySelector('.navigation').append(replay);
  function reveal(element, visible) {
    element.classList.add('reveal');
    element.classList.toggle('revealed', visible);
    element.setAttribute('aria-hidden', String(!visible));
  }
  function restore() {
    generation++;
    zoomOut(true);
    suggestion.clear();
    editor.updateOptions({ readOnly: false });
    if (demoModel) {
      editor.setModel(models[getSlide()]);
      demoModel.dispose();
      demoModel = null;
    }
    document.querySelector('.code-panel').classList.remove('typing-demo');
  }
  function paint() {
    const slide = getSlide();
    const diagramVisible = slide === 1 && step === 2;
    architecture.show(diagramVisible);
    codePanel.hidden = diagramVisible;
    if (!diagramVisible) requestAnimationFrame(() => editor.layout());
    reveal(description, step >= 1);
    reveal(author, step >= 2);
    reveal(principles, step >= 2);
    reveal(takeaway, step === labels[slide].length - 1);
    status.textContent = `${step + 1}/${labels[slide].length} · ${labels[slide][step]}`;
    document.getElementById('previous').disabled = slide === 0 && step === 0;
    document.getElementById('next').disabled = slide === 2 && step === labels[slide].length - 1;
    document.getElementById('next').setAttribute('aria-label', 'Next step');
    document.getElementById('previous').setAttribute('aria-label', 'Previous step');
  }
  async function typeEdit() {
    const original = models[2].getValue();
    const target = 'total > 0';
    const offset = original.indexOf(target);
    if (offset < 0) {
      status.textContent = 'Demo needs “total > 0”; reset the example to replay.';
      return;
    }
    demoModel = monaco.editor.createModel(original, 'typescript', monaco.Uri.parse('file:///typing-demo.ts'));
    editor.setModel(demoModel);
    editor.updateOptions({ readOnly: true });
    document.querySelector('.code-panel').classList.add('typing-demo');
    const token = ++generation;
    const start = demoModel.getPositionAt(offset);
    const end = demoModel.getPositionAt(offset + target.length);
    const range = new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column);
    editor.setPosition(start);
    highlightEdit(start, target.length, true);
    editor.revealLineInCenter(start.lineNumber, monaco.editor.ScrollType.Immediate);
    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    zoomToCode(start);
    await pause(reduced ? 0 : 950);
    if (token !== generation) return;
    demoModel.applyEdits([{ range, text: '' }]);
    highlightEdit(start, 0);
    let position = start;
    for (const character of replacement) {
      if (token !== generation) return;
      demoModel.applyEdits([{ range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column), text: character }]);
      position = { lineNumber: position.lineNumber, column: position.column + 1 };
      editor.setPosition(position);
      highlightEdit(start, position.column - start.column);
      await pause(reduced ? 0 : 100);
    }
    if (token !== generation) return;
    document.querySelector('.code-panel').classList.remove('typing-demo');
    await pause(reduced ? 0 : 700);
    if (token !== generation) return;
    zoomOut();
    status.textContent = 'Edit complete · Next: run the changed example';
  }
  function reset() {
    restore();
    step = 0;
    document.getElementById('output').hidden = true;
    paint();
  }
  async function next() {
    const slide = getSlide();
    if (step === labels[slide].length - 1) {
      if (slide < 2) goToSlide(slide + 1);
      return;
    }
    // Finish an in-flight typing animation before advancing.
    if (slide === 2 && step === 2 && demoModel) {
      generation++;
      zoomOut();
      demoModel.setValue(models[2].getValue().replace('total > 0', 'total >= 0'));
      highlightCompletedEdit();
      document.querySelector('.code-panel').classList.remove('typing-demo');
    }
    step++;
    paint();
    if (slide === 1 && step === 3) {
      const match = models[1].findMatches('OrderStore', false, false, true, null, false)[0];
      if (match) { editor.setPosition(match.range.getStartPosition()); editor.revealLineInCenter(match.range.startLineNumber); }
      editor.focus();
      await editor.getAction('editor.action.showContextMenu').run();
    }
    if (slide === 2 && step === 2) void typeEdit();
    if (slide === 2 && step === 3) runChecks();
  }
  function previous() {
    if (step === 0) { if (getSlide() > 0) goToSlide(getSlide() - 1); return; }
    restore();
    document.getElementById('output').hidden = true;
    step--;
    // Re-enter the typing beat from its initial state when going backwards.
    paint();
    if (getSlide() === 2 && step >= 2) {
      demoModel = monaco.editor.createModel(models[2].getValue().replace('total > 0', 'total >= 0'), 'typescript', monaco.Uri.parse('file:///typing-demo.ts'));
      editor.setModel(demoModel);
      editor.updateOptions({ readOnly: true });
      highlightCompletedEdit();
    }
  }
  return { reset, restore, next, previous };
}
