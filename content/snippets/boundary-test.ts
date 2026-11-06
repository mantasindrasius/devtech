export function canPlaceOrder(total: number) {
  return Number.isFinite(total) && total > 0;
}

const cases = [
  { total: 42, expected: true },
  { total: 0, expected: false },
  { total: -5, expected: false },
  { total: NaN, expected: false },
];

for (const { total, expected } of cases) {
  if (canPlaceOrder(total) !== expected) throw new Error('Incorrect rule for ' + total);
}
