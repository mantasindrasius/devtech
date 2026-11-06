// GOOD: one capability; policy stays inside.
import { createQuotes } from '@shop/order-quotes';

const quotes = createQuotes(catalog);

const result = await quotes.quote({
  items: [{ productId: 'book', quantity: 2 }],
  coupon: 'WELCOME10',
  destination: 'US',
});

// The module owns validation, price lookup,
// discount ordering, rounding, and shipping.
// Its contract defines money units and errors.
// Internal helpers are not public packages.
