/**
 * Runs a looping animation only while the story layer containing it is revealed.
 * `play` receives a signal that aborts when the layer is hidden again; `showStill`
 * is the reduced-motion alternative; `reset` returns the art to its resting state.
 * `sync({ active: false })` cancels playback but retains the visible frame. A later
 * active sync starts a new run; hiding or stopping clears the frame.
 */
export function revealedPlayback(layer, { play, showStill, reset, reducedMotion }) {
  let playback;
  let started = false;

  function start() {
    started = true;
    if (reducedMotion()) {
      showStill();
      return;
    }
    playback = new AbortController();
    play(playback.signal);
  }

  function pause() {
    playback?.abort();
    playback = undefined;
    started = false;
  }

  function stop() {
    pause();
    reset();
  }

  return {
    stop,
    sync({ active = true } = {}) {
      const revealed = layer.classList.contains('is-visible');
      if (!revealed) stop();
      else if (!active) pause();
      else if (!started) start();
    },
  };
}
