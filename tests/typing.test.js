import { expect, test } from 'bun:test';
import { aTypingDemo } from './support/typing-driver.js';

test('zooms in for a suggestion and returns after typing without changing saved code', async () => {
  const demo = aTypingDemo();

  await demo.play();

  expect(demo.visibleCode()).toBe('total >= 0');
  expect(demo.savedCode()).toBe('total > 0');
  expect(demo.events()).toEqual(['removal', 'zoom-in', 'zoom-out', 'finished']);
  demo.dispose();
});

test('replaying restores the saved code after a suggestion', async () => {
  const demo = aTypingDemo();
  await demo.play();

  demo.dispose();

  expect(demo.visibleCode()).toBe('total > 0');
});

test('reduced motion applies the replacement without camera movement', async () => {
  const demo = aTypingDemo().withReducedMotion();

  await demo.play();

  expect(demo.visibleCode()).toBe('total >= 0');
  expect(demo.events()).toEqual([]);
  demo.dispose();
});

test('reconstructing a previous edit does not replay its animation', async () => {
  const demo = aTypingDemo();

  await demo.restoreInstantly();

  expect(demo.visibleCode()).toBe('total >= 0');
  expect(demo.events()).toEqual([]);
  demo.dispose();
});

test('cancelling during typing restores saved code and prevents later writes', async () => {
  const demo = aTypingDemo().pausedAtFirstDelay();
  const playback = demo.play();
  await demo.whenPaused();

  demo.cancel();

  await expect(playback).rejects.toThrow();
  expect(demo.visibleCode()).toBe(demo.savedCode());
  expect(demo.events()).toEqual(['removal', 'zoom-in']);
});
