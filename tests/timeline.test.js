import { expect, test } from 'bun:test';
import { aPresentation } from './support/presentation-driver.js';
import { Registry } from '../src/core/registry.js';

test('executes a registered extension without changing the timeline', async () => {
  const presentation = aPresentation()
    .withRecordingAction('confetti')
    .withSteps([
      { id: 'start', label: 'Start' },
      {
        id: 'celebrate',
        label: 'Celebrate',
        actions: [{ type: 'confetti', name: 'new extension' }],
      },
    ]);
  await presentation.mount();

  await presentation.next();

  expect(presentation.observations().events).toEqual([{ name: 'new extension', animate: true }]);
  presentation.dispose();
});

test('reconstructs earlier effects without animation before executing the next step', async () => {
  const presentation = aPresentation()
    .withRecordingAction('effect')
    .withSteps([
      { id: 'first', label: 'First', actions: [{ type: 'effect', name: 'first' }] },
      { id: 'second', label: 'Second', actions: [{ type: 'effect', name: 'second' }] },
    ]);
  await presentation.mount();

  await presentation.next();

  expect(presentation.observations().events).toEqual([
    { name: 'first', animate: true },
    { name: 'first', animate: false },
    { name: 'second', animate: true },
  ]);
  expect(presentation.observations().cleanups).toBe(1);
  presentation.dispose();
});

test('cancels an unfinished step on replay and ignores its stale completion', async () => {
  let finish;
  let signal;
  const presentation = aPresentation()
    .withAction('pending', () => ({
      run: (options) => {
        signal = options.signal;
        return new Promise((resolve) => {
          finish = resolve;
        });
      },
      dispose() {},
    }))
    .withSteps([
      { id: 'start', label: 'Start' },
      { id: 'pending', label: 'Pending', actions: [{ type: 'pending' }] },
    ]);
  await presentation.mount();
  const pending = presentation.next();

  await presentation.replay();
  finish();
  await pending;

  expect(signal.aborted).toBe(true);
  expect(presentation.observations().completed).toEqual(['start', 'start']);
  expect(presentation.observations().errors).toEqual([]);
  presentation.dispose();
});

test('reports a failing extension and disposes its resources once', async () => {
  let cleanups = 0;
  const presentation = aPresentation()
    .withAction('failing', () => ({
      run() {
        throw new Error('Effect unavailable');
      },
      dispose() {
        cleanups++;
      },
    }))
    .withSteps([{ id: 'failure', label: 'Failure', actions: [{ type: 'failing' }] }]);

  await presentation.mount();
  presentation.dispose();
  presentation.dispose();

  expect(presentation.observations().errors).toEqual(['Effect unavailable']);
  expect(cleanups).toBe(1);
});

test('rejects duplicate extension registrations', () => {
  const registry = new Registry('step action').register('custom', {});

  expect(() => registry.register('custom', {})).toThrow('Duplicate step action: custom');
});
