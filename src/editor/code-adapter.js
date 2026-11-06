import { createSuggestions } from './suggestions.js';

export function createCodeAdapter({ monaco, editor, models, panel }) {
  const suggestions = createSuggestions(monaco, editor);
  let currentId;
  let sequence = 0;
  return {
    show(id) {
      currentId = id;
      editor.setModel(models.get(id));
      editor.updateOptions({ readOnly: false });
      suggestions.clear();
    },
    reset() {
      models.reset(currentId);
    },
    openContextMenu(target) {
      const match = editor.getModel().findMatches(target, false, false, true, null, false)[0];
      if (!match) throw new Error(`Context-menu target not found: ${target}`);
      editor.setPosition(match.range.getStartPosition());
      editor.revealLineInCenter(match.range.startLineNumber);
      editor.focus();
      return editor.getAction('editor.action.showContextMenu').run();
    },
    closeContextMenu() {
      // Monaco listens for Escape on its focused context-menu element.
      if (document.activeElement?.closest('.context-view')) {
        document.activeElement.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }),
        );
      }
    },
    beginEdit(find, replacement) {
      const original = editor.getModel();
      const source = original.getValue();
      const offset = source.indexOf(find);
      if (offset < 0)
        throw new Error(`Edit target not found: ${find}. Reset the code example to replay.`);
      if (find.includes('\n') || replacement.includes('\n'))
        throw new Error('Typing suggestions currently require a single-line expression');
      const model = monaco.editor.createModel(
        source,
        original.getLanguageId(),
        monaco.Uri.parse(`file:///demo-${++sequence}.ts`),
      );
      editor.setModel(model);
      editor.updateOptions({ readOnly: true });
      const start = model.getPositionAt(offset);
      editor.setPosition(start);
      editor.revealLineInCenter(start.lineNumber, monaco.editor.ScrollType.Immediate);
      return createEditSession({ model, original, source, offset, find, replacement, start });
    },
  };

  function createEditSession({ model, original, source, offset, find, replacement, start }) {
    let disposed = false;
    const finish = () => panel.classList.remove('typing-demo');
    return {
      position: start,
      markRemoval() {
        panel.classList.add('typing-demo');
        suggestions.show(start, find, replacement, true);
      },
      replace(text) {
        if (disposed) return;
        model.setValue(source.slice(0, offset) + text + source.slice(offset + find.length));
        editor.setPosition(model.getPositionAt(offset + text.length));
        suggestions.show(start, text, replacement);
      },
      finish,
      dispose() {
        if (disposed) return;
        disposed = true;
        suggestions.clear();
        if (editor.getModel() === model) editor.setModel(original);
        model.dispose();
        editor.updateOptions({ readOnly: false });
        finish();
      },
    };
  }
}
