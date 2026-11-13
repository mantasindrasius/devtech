// One shipping rule; assume 100% coverage.
// C = 2; CRAP = 2² × 0³ + 2 = 2.
export function shipping(subtotalCents: number) {
  return subtotalCents >= 5000 ? 0 : 500;
}
