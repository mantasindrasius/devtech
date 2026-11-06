/** Rebuild prior state without animation, then execute the selected beat. */
export function createTimeline({ deck, actions, context, view }) {
  let slideIndex = 0;
  let stepIndex = 0;
  let active = null;
  let disposed = false;

  function cancel() {
    if (!active) return;
    active.controller.abort();
    for (const command of active.commands.reverse()) command.dispose();
    active = null;
  }

  function snapshot() {
    const slide = deck.slides[slideIndex];
    return {
      slide,
      slideIndex,
      stepIndex,
      step: slide.steps[stepIndex],
      first: slideIndex === 0 && stepIndex === 0,
      last: slideIndex === deck.slides.length - 1 && stepIndex === slide.steps.length - 1,
    };
  }

  async function select(nextSlide, nextStep = 0) {
    if (disposed) return;
    cancel();
    slideIndex = Math.max(0, Math.min(deck.slides.length - 1, nextSlide));
    const slide = deck.slides[slideIndex];
    stepIndex = Math.max(0, Math.min(slide.steps.length - 1, nextStep));
    const run = { controller: new AbortController(), commands: [] };
    active = run;
    try {
      context.code.show(slide.code);
      context.checks.clear();
      view.show(snapshot());
      await executeSteps(slide.steps.slice(0, stepIndex + 1), run);
      if (active === run) view.completed(snapshot());
    } catch (error) {
      if (active !== run || run.controller.signal.aborted) return;
      cancel();
      view.error(error);
    }
  }

  async function executeSteps(steps, run) {
    for (const [index, step] of steps.entries()) {
      for (const options of step.actions ?? []) {
        run.controller.signal.throwIfAborted();
        const command = actions.get(options.type).create(options, context);
        run.commands.push(command);
        await command.run({ signal: run.controller.signal, animate: index === steps.length - 1 });
      }
    }
  }

  return {
    select,
    next: () =>
      stepIndex < deck.slides[slideIndex].steps.length - 1
        ? select(slideIndex, stepIndex + 1)
        : slideIndex < deck.slides.length - 1
          ? select(slideIndex + 1)
          : Promise.resolve(),
    previous: () =>
      stepIndex > 0
        ? select(slideIndex, stepIndex - 1)
        : slideIndex > 0
          ? select(slideIndex - 1)
          : Promise.resolve(),
    replay: () => select(slideIndex),
    snapshot,
    dispose() {
      if (!disposed) {
        cancel();
        disposed = true;
      }
    },
  };
}
