// A pure rule. No network. No hidden state.
export function canPlaceOrder(total: number) {
  return Number.isFinite(total) && total > 0;
}

// Examples define the behavior at the boundary.
const cases = [
  { total: 42, expected: true },
  { total: 0, expected: false },
  { total: -5, expected: false },
  { total: NaN, expected: false },
];

for (const { total, expected } of cases) {
  const actual = canPlaceOrder(total);
  if (actual !== expected) {
    throw new Error(`Unexpected result: ${total}`);
  }
}
// Try changing > 0 to >= 0, then run the checks.
