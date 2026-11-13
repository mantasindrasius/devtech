import { expect, test } from 'bun:test';
import { playWordStream } from '../src/renderers/word-stream.js';

function aResponse(text) {
  const observed = { frames: [], finished: 0 };
  return {
    rows: [{
      text,
      write: (value) => observed.frames.push(value),
      finish: () => observed.finished++,
    }],
    observed,
  };
}

test('streams complete words in order and finishes the response', async () => {
  const response = aResponse('✓ Checked the diff.');

  await playWordStream(response, {
    wait: async () => {}, signal: new AbortController().signal,
  });

  expect(response.observed.frames).toEqual(['✓ ', '✓ Checked ', '✓ Checked the ', '✓ Checked the diff.']);
  expect(response.observed.finished).toBe(1);
});

test('leaving the scene stops streaming before another word is written', async () => {
  const response = aResponse('Checked the diff.');
  const controller = new AbortController();
  let waits = 0;

  await playWordStream(response, {
    signal: controller.signal,
    wait: async () => { if (++waits === 2) controller.abort(); },
  });

  expect(response.observed.frames).toEqual(['Checked ']);
  expect(response.observed.finished).toBe(0);
});
