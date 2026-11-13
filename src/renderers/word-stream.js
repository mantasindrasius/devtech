export function wordStreamTranscript(element) {
  const rows = [...element.querySelectorAll('[data-stream]')].map((node) => ({
    text: node.textContent,
    write(text) {
      node.hidden = false;
      node.textContent = text;
      node.classList.add('streaming');
    },
    finish() { node.classList.remove('streaming'); },
    clear() {
      node.hidden = true;
      node.textContent = '';
      node.classList.remove('streaming');
    },
  }));
  return {
    rows,
    clear: () => rows.forEach((row) => row.clear()),
    complete: () => rows.forEach((row) => { row.write(row.text); row.finish(); }),
  };
}

/** A single response; callers own replay and cancel when leaving the scene. */
export async function playWordStream(transcript, { wait, signal }) {
  try {
    for (const row of transcript.rows) {
      let text = '';
      for (const word of row.text.match(/\S+\s*/g) ?? []) {
        await wait(65, signal);
        signal.throwIfAborted();
        text += word;
        row.write(text);
      }
      row.finish();
      await wait(280, signal);
    }
  } catch (error) {
    if (!signal.aborted) throw error;
  }
}
