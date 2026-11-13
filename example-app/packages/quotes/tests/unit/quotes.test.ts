import { expect, test } from 'bun:test';
import { createQuotes } from '@example/quotes';

function quoteAtPrice(priceCents: number, coupon = '') {
  const quotes = createQuotes({
    product: (id) => ({ id, name: 'One item', description: '', icon: '', priceCents }),
  });
  return quotes.quote({ items: [{ productId: 'item', quantity: 1 }], coupon });
}

test('shipping becomes free exactly at the threshold', () => {
  expect(quoteAtPrice(10_000).shippingCents).toBe(0);
  expect(quoteAtPrice(9_999).shippingCents).toBe(500);
});
test('a discount can move the order back below free shipping', () => {
  const quote = quoteAtPrice(10_000, 'TRAIL10');
  expect(quote).toMatchObject({ discountCents: 1000, shippingCents: 500, totalCents: 9500 });
});
test('fractional discount cents round once to the nearest cent', () => {
  expect(quoteAtPrice(10_005, 'TRAIL10').discountCents).toBe(1001);
});
test('coupon input is normalized before calculating the discount', () => {
  expect(quoteAtPrice(8000, ' trail10 ').discountCents).toBe(800);
});
