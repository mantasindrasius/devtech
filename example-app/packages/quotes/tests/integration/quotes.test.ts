import { afterEach, expect, test } from 'bun:test';
import { openShopStore } from '@example/sqlite-store';
import { createCatalog } from '@example/catalog';
import { createQuotes } from '@example/quotes';
import { aBasket } from '../../../../test-support/basket';

const stores: ReturnType<typeof openShopStore>[] = [];
afterEach(() => stores.splice(0).forEach((store) => store.close()));
const shop = () => {
  const store = openShopStore(':memory:');
  stores.push(store);
  const catalog = createCatalog(store.catalog);
  const quotes = createQuotes(catalog);
  return quotes;
};

test('quote composes catalog prices, coupons and shipping', async () => {
  const basket = aBasket().withItem('daypack').withItem('flask').withCoupon('TRAIL10').build();
  const quote = await shop().quote(basket);
  expect(quote).toMatchObject({
    subtotalCents: 10500,
    discountCents: 1050,
    shippingCents: 500,
    totalCents: 9950,
  });
});

test('client-supplied prices cannot change the payable amount', () => {
  const quote = shop().quote({
    items: [{ productId: 'daypack', quantity: 1, priceCents: 1 }],
    totalCents: 1,
  });
  expect(quote.totalCents).toBe(8500);
});

test('duplicate lines cannot bypass the quantity limit', () => {
  const quotes = shop();
  expect(() => quotes.quote(aBasket().withItem('flask', 20).withItem('flask', 20).build())).toThrow(
    'Combine duplicate cart items.',
  );
});
