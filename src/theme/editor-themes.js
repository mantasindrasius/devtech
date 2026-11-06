export function defineEditorThemes(monaco) {
  monaco.editor.defineTheme('talk-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6D7D89', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C3A6F5' },
      { token: 'string', foreground: 'B5D6A1' },
      { token: 'number', foreground: 'E7BD8A' },
      { token: 'type.identifier', foreground: '86CBCB' },
    ],
    colors: {
      'editor.background': '#15191F',
      'editor.foreground': '#CAD3DE',
      'editorLineNumber.foreground': '#4F5968',
      'editorLineNumber.activeForeground': '#B3BDCE',
      'editorCursor.foreground': '#B4F39A',
      'editor.selectionBackground': '#344C48',
      'editorIndentGuide.background1': '#242B35',
    },
  });

  monaco.editor.defineTheme('talk-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '64746B', fontStyle: 'italic' },
      { token: 'keyword', foreground: '7636A3' },
      { token: 'string', foreground: '357127' },
      { token: 'number', foreground: '92580E' },
      { token: 'type.identifier', foreground: '096B77' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#24312D',
      'editorLineNumber.foreground': '#748078',
      'editorLineNumber.activeForeground': '#24312D',
      'editorCursor.foreground': '#397627',
      'editor.selectionBackground': '#D6E7D0',
      'editorIndentGuide.background1': '#E3E9E0',
    },
  });
}
