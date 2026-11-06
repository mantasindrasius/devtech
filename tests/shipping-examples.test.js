import { expect, test } from 'bun:test';
import { shipping as nested } from '../content/snippets/shipping-nested.ts';
import { shipping as clear } from '../content/snippets/shipping-clear.ts';

test.each([
  ['international express', false, true, false, 1000, 3000],
  ['international standard ignores membership', false, false, true, 6000, 1500],
  ['US express takes priority over membership', true, true, true, 6000, 1500],
  ['US express without membership', true, true, false, 1000, 1500],
  ['US standard membership', true, false, true, 1000, 0],
  ['US standard below the threshold', true, false, false, 4999, 500],
  ['US standard at the threshold', true, false, false, 5000, 0],
  ['US standard above the threshold', true, false, false, 5001, 0],
])('%s preserves the fee through the refactor', (_, us, express, member, subtotal, fee) => {
  const originalFee = nested(us, express, member, subtotal);
  const refactoredFee = clear(us, express, member, subtotal);

  expect(originalFee).toBe(fee);
  expect(refactoredFee).toBe(fee);
});
