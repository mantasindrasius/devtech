// What an agent should discover nearby:
const packageGuide = {
  purpose: 'Validate and persist orders',
  entry: 'place-order.ts',
  invariant: 'Only finite positive totals',
  example: 'place-order.test.ts',
  verify: 'bun test packages/orders',
  ownership: 'Orders team',
  forbidden: 'Direct HTTP or SQL in rules',
};
