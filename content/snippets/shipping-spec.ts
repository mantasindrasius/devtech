// GOOD: independent examples at the interface.
// All amounts are cents.
test.each([
  // us, express, member, subtotal, fee
  [false, true, false, 1000, 3000],
  [false, false, true, 6000, 1500],
  [true, true, true, 6000, 1500],
  [true, false, true, 1000, 0],
  [true, false, false, 4999, 500],
  [true, false, false, 5000, 0],
])('shipping policy', (us, express, member, subtotal, fee) => {
  expect(shipping(us, express, member, subtotal)).toBe(fee);
});

// Guard ordering is behavior.
// Moving membership above express breaks a case.
