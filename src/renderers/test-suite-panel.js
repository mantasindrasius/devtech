/**
 * Adapts a `.test-suite` element to the suite the test-suite player drives. Each
 * `.test-run` row carries its duration and the ids of the diagram elements it exercises.
 * CSS turns `data-state`, `data-tests-running` and `data-test-pulse` into motion.
 */
export function testSuitePanel(element, diagram) {
  const rows = [...element.querySelectorAll('.test-run')].map((row) => readRow(row, diagram));
  if (rows.length === 0) throw new Error('Test suite needs at least one test-run');
  const summary = element.querySelector('.suite-summary');

  function settle({ row, targets }, state) {
    if (row.dataset.state === 'running') for (const target of targets) countRunning(target, -1);
    row.dataset.state = state;
  }

  return {
    tests: rows.map(({ runMs }) => ({ runMs })),
    reset() {
      for (const test of rows) settle(test, 'queued');
      summary.textContent = '';
    },
    begin(index) {
      const { row, targets } = rows[index];
      row.dataset.state = 'running';
      for (const target of targets) {
        countRunning(target, +1);
        restartPulse(target);
      }
    },
    pass(index) {
      settle(rows[index], 'passed');
    },
    summarise({ passed, elapsedMs }) {
      summary.textContent = `${passed} passed · ${formatDuration(elapsedMs)}`;
    },
  };
}

function readRow(row, diagram) {
  const runMs = Number(row.dataset.runMs);
  if (!(runMs > 0)) throw new Error(`Test run needs a positive data-run-ms: ${row.dataset.runMs}`);
  const targets = (row.dataset.targets ?? '')
    .split(' ')
    .filter(Boolean)
    .map((id) => {
      const target = diagram.querySelector(`#${id}`);
      if (!target) throw new Error(`Test run targets an unknown element: ${id}`);
      return target;
    });
  row.querySelector('.test-time').textContent = formatDuration(runMs);
  return { row, runMs, targets };
}

function countRunning(target, change) {
  const running = Math.max(0, Number(target.dataset.testsRunning ?? 0) + change);
  target.dataset.testsRunning = String(running);
}

/** Alternating between two identical animations restarts the pulse for every test. */
function restartPulse(target) {
  target.dataset.testPulse = target.dataset.testPulse === 'a' ? 'b' : 'a';
}

/** 46 → "46ms"; 2400 → "2.4s". */
export function formatDuration(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}
