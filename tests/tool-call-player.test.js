import { expect, test } from 'bun:test';
import { playToolCalls, showCompletedToolCalls } from '../src/renderers/tool-call-player.js';

/** Records what a transcript is told to show, stamped with the virtual time it happened at. */
function aTranscript(...calls) {
  const clock = { nowMs: 0 };
  const shown = [];
  const record = (event) => shown.push(`${clock.nowMs}ms ${event}`);
  return {
    clock,
    shown,
    calls,
    clear: () => record('clear'),
    think: () => record('think'),
    begin: (index) => record(`begin ${index}`),
    finish: (index) => record(`finish ${index}`),
  };
}

/** Advances virtual time instantly and stops the playback once `untilMs` has passed. */
function aVirtualClock(transcript, { untilMs }) {
  const playback = new AbortController();
  return {
    signal: playback.signal,
    async wait(ms, signal) {
      signal.throwIfAborted();
      transcript.clock.nowMs += ms;
      if (transcript.clock.nowMs >= untilMs) playback.abort(new Error('stopped'));
      signal.throwIfAborted();
    },
  };
}

test('shows each tool call after its thinking pause and its result after its run time', async () => {
  const transcript = aTranscript({ thinkMs: 900, runMs: 350 }, { thinkMs: 500, runMs: 2600 });
  const clock = aVirtualClock(transcript, { untilMs: 6000 });

  await playToolCalls(transcript, clock);

  expect(transcript.shown).toEqual([
    '0ms clear',
    '450ms think',
    '1350ms begin 0',
    '1700ms finish 0',
    '1700ms think',
    '2200ms begin 1',
    '4800ms finish 1',
  ]);
});

test('starts the transcript over after resting on the finished calls', async () => {
  const transcript = aTranscript({ thinkMs: 100, runMs: 100 });
  const clock = aVirtualClock(transcript, { untilMs: 3400 });

  await playToolCalls(transcript, clock);

  expect(transcript.shown.slice(-2)).toEqual(['650ms finish 0', '3250ms clear']);
});

test('shows nothing further once playback is stopped mid-call', async () => {
  const transcript = aTranscript({ thinkMs: 900, runMs: 350 });
  const clock = aVirtualClock(transcript, { untilMs: 1400 });

  await playToolCalls(transcript, clock);

  expect(transcript.shown.at(-1)).toBe('1350ms begin 0');
});

test('reports a failure that is not the playback being stopped', async () => {
  const transcript = aTranscript({ thinkMs: 900, runMs: 350 });
  const brokenClock = {
    signal: new AbortController().signal,
    wait: async () => {
      throw new Error('timer unavailable');
    },
  };

  await expect(playToolCalls(transcript, brokenClock)).rejects.toThrow('timer unavailable');
});

test('shows every call finished at once when motion is reduced', () => {
  const transcript = aTranscript({ thinkMs: 900, runMs: 350 }, { thinkMs: 500, runMs: 2600 });

  showCompletedToolCalls(transcript);

  expect(transcript.shown).toEqual(['0ms begin 0', '0ms finish 0', '0ms begin 1', '0ms finish 1']);
});
