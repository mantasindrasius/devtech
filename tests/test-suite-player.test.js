import { expect, test } from 'bun:test';
import { formatDuration } from '../src/renderers/test-suite-panel.js';
import { runSuiteOnRepeat, showPassedSuite } from '../src/renderers/test-suite-player.js';

/** Records what a suite is told to show, stamped with the virtual time it happened at. */
function aSuite(...runTimesMs) {
  const clock = { nowMs: 0 };
  const shown = [];
  const record = (event) => shown.push(`${clock.nowMs}ms ${event}`);
  return {
    clock,
    shown,
    tests: runTimesMs.map((runMs) => ({ runMs })),
    reset: () => record('reset'),
    begin: (index) => record(`run ${index}`),
    pass: (index) => record(`pass ${index}`),
    summarise: ({ passed, elapsedMs }) => record(`${passed} passed in ${elapsedMs}`),
  };
}

/** Advances virtual time instantly and stops the run once `untilMs` has passed. */
function aVirtualClock(suite, { untilMs }) {
  const run = new AbortController();
  return {
    signal: run.signal,
    async wait(ms, signal) {
      signal.throwIfAborted();
      suite.clock.nowMs += ms;
      if (suite.clock.nowMs >= untilMs) run.abort(new Error('stopped'));
      signal.throwIfAborted();
    },
  };
}

test('passes each test after its own run time and reports the suite total', async () => {
  const suite = aSuite(12, 46);

  await runSuiteOnRepeat(suite, aVirtualClock(suite, { untilMs: 1000 }));

  expect(suite.shown).toEqual([
    '0ms reset',
    '400ms run 0',
    '412ms pass 0',
    '412ms run 1',
    '458ms pass 1',
    '458ms 2 passed in 58',
  ]);
});

test('runs the suite again after resting on its result', async () => {
  const suite = aSuite(100);

  await runSuiteOnRepeat(suite, aVirtualClock(suite, { untilMs: 3000 }));

  expect(suite.shown.slice(-2)).toEqual(['500ms 1 passed in 100', '2700ms reset']);
});

test('shows nothing further once the run is stopped mid-test', async () => {
  const suite = aSuite(2400, 900);

  await runSuiteOnRepeat(suite, aVirtualClock(suite, { untilMs: 1000 }));

  expect(suite.shown.at(-1)).toBe('400ms run 0');
});

test('shows the whole suite passed at once when motion is reduced', () => {
  const suite = aSuite(12, 46);

  showPassedSuite(suite);

  expect(suite.shown).toEqual(['0ms reset', '0ms pass 0', '0ms pass 1', '0ms 2 passed in 58']);
});

test.each([
  [5, '5ms'],
  [900, '900ms'],
  [2400, '2.4s'],
  [3000, '3.0s'],
])('formats a %ims test duration as %s', (ms, text) => {
  expect(formatDuration(ms)).toBe(text);
});
