const clearMs = 450;
const restMs = 2600;

/**
 * Plays a transcript the way a live chat shows tool calls: the agent thinks, a call
 * appears and runs, its result arrives. Repeats until `signal` aborts; nothing is
 * updated after that.
 */
export async function playToolCalls(transcript, { wait, signal }) {
  try {
    for (;;) await playOnce(transcript, { wait, signal });
  } catch (error) {
    if (!signal.aborted) throw error;
  }
}

async function playOnce(transcript, { wait, signal }) {
  transcript.clear();
  await wait(clearMs, signal);
  for (const [index, call] of transcript.calls.entries()) {
    transcript.think();
    await wait(call.thinkMs, signal);
    transcript.begin(index);
    await wait(call.runMs, signal);
    transcript.finish(index);
  }
  await wait(restMs, signal);
}

/** The reduced-motion alternative: the finished transcript, with nothing left running. */
export function showCompletedToolCalls(transcript) {
  transcript.calls.forEach((_, index) => {
    transcript.begin(index);
    transcript.finish(index);
  });
}
