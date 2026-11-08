import { expect, test } from 'bun:test';
import { chooseCreatureSlots } from '../src/renderers/spacecraft-maintenance.js';

test('parallel ships receive different amounts of unwanted features', () => {
  const fixedRandom = () => 0.5;

  const ships = [1, 2, 3].map((ship) => chooseCreatureSlots(ship, fixedRandom));

  expect(ships.map((slots) => slots.length)).toEqual([3, 1, 2]);
  for (const slots of ships) expect(new Set(slots).size).toBe(slots.length);
});

test('random selection changes which creatures attach to a rocket', () => {
  const lowDraw = () => 0;
  const highDraw = () => 0.99;

  const firstRun = chooseCreatureSlots(2, lowDraw);
  const secondRun = chooseCreatureSlots(2, highDraw);

  expect(firstRun).toEqual([1]);
  expect(secondRun).toEqual([0]);
});
