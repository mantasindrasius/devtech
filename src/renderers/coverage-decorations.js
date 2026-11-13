/** Coverage is authored demo data, never inferred from a complexity score. */
export function coverageDecorations(lines, lineCount) {
  if (!Array.isArray(lines)) throw new Error('Coverage lines must be a list');
  return lines.map(({ line, covered }) => {
    if (!Number.isInteger(line) || line < 1 || line > lineCount || typeof covered !== 'boolean')
      throw new Error(`Invalid coverage line: ${line}`);
    const state = covered ? 'covered' : 'uncovered';
    return {
      range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
      options: {
        isWholeLine: true,
        className: `metrics-coverage-${state}`,
        linesDecorationsClassName: `metrics-coverage-gutter-${state}`,
        hoverMessage: { value: `${covered ? 'Covered' : 'Not covered'} — illustrative coverage` },
      },
    };
  });
}
