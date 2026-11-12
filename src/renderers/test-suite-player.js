const startDelayMs = 400;
const restMs = 2200;

/**
 * Runs a suite the way a test runner in watch mode shows it: each test runs for its own
 * duration and then passes, a summary follows, and after a rest the suite runs again.
 * Repeats until `signal` aborts; nothing is updated after that.
 */
export async function runSuiteOnRepeat(suite, { wait, signal }) {
  try {
    for (;;) {
      suite.reset();
      await wait(startDelayMs, signal);
      for (const [index, test] of suite.tests.entries()) {
        suite.begin(index);
        await wait(test.runMs, signal);
        suite.pass(index);
      }
      suite.summarise(suiteResult(suite));
      await wait(restMs, signal);
    }
  } catch (error) {
    if (!signal.aborted) throw error;
  }
}

function suiteResult({ tests }) {
  return {
    passed: tests.length,
    elapsedMs: tests.reduce((total, test) => total + test.runMs, 0),
  };
}

/** The reduced-motion alternative: the finished run, every test passed. */
export function showPassedSuite(suite) {
  suite.reset();
  suite.tests.forEach((_, index) => suite.pass(index));
  suite.summarise(suiteResult(suite));
}
