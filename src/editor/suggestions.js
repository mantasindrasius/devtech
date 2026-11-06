export function createSuggestions(monaco, editor) {
  const decorations = editor.createDecorationsCollection();
  return {
    show(start, inserted, replacement, removing = false) {
      const endColumn = start.column + inserted.length;
      const range = new monaco.Range(start.lineNumber, start.column, start.lineNumber, endColumn);
      const items = [
        {
          range,
          options: {
            isWholeLine: true,
            className: 'suggestion-line',
            linesDecorationsClassName: 'suggestion-gutter',
          },
        },
        {
          range,
          options: { inlineClassName: removing ? 'suggestion-removed' : 'suggestion-inserted' },
        },
      ];
      if (!removing && inserted.length < replacement.length) {
        items.push({
          range: new monaco.Range(start.lineNumber, endColumn, start.lineNumber, endColumn),
          options: {
            after: {
              content: replacement.slice(inserted.length),
              inlineClassName: 'suggestion-ghost',
            },
          },
        });
      }
      decorations.set(items);
    },
    clear: () => decorations.clear(),
  };
}
