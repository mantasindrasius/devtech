/**
 * Runs a looping animation only while the story layer containing it is revealed.
 * `play` receives a signal that aborts when the layer is hidden again; `showStill`
 * is the reduced-motion alternative; `reset` returns the art to its resting state.
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

  function stop() {
    playback?.abort();
    playback = undefined;
    started = false;
    reset();
  }

  return {
    stop,
    sync() {
      const revealed = layer.classList.contains('is-visible');
      if (!revealed) stop();
      else if (!started) start();
    },
  };
}
