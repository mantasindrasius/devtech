import { afterEach, expect, test } from 'bun:test';
import { openShopStore } from '@example/sqlite-store';
import { createCatalog } from '@example/catalog';
import { createQuotes } from '@example/quotes';
import { aBasket } from '../../../../test-support/basket';
import { createOrders } from '@example/orders';

const stores: ReturnType<typeof openShopStore>[] = [];
afterEach(() => stores.splice(0).forEach((store) => store.close()));
const shop = () => {
  const store = openShopStore(':memory:');
  stores.push(store);
  const catalog = createCatalog(store.catalog);
  const quotes = createQuotes(catalog);
  const orders = createOrders({ quotes, store: store.orders });
  return orders;
};

test('placing an order preserves its price snapshot and can be read back', async () => {
  const driver = shop();
  const order = await driver.place(aBasket().withItem('lamp', 2).build(), 'order-attempt-02');
  expect(driver.get(order.id)).toEqual(order);
  expect(order.quote.totalCents).toBe(9500);
});

test('retrying the same request returns the original order', async () => {
  const driver = shop();
  const basket = aBasket().withItem('daypack').build();
  const first = await driver.place(basket, 'retry-attempt-01');
  const retry = await driver.place(basket, 'retry-attempt-01');
  expect(retry).toEqual(first);
});

test('independent in-memory compositions can run concurrently without sharing orders', async () => {
  const left = shop();
  const right = shop();
  const basket = aBasket().withItem('flask').build();
  const [one, two] = await Promise.all([
    left.place(basket, 'parallel-request'),
    right.place(basket, 'parallel-request'),
  ]);
  expect(one.id).not.toBe(two.id);
  expect(() => right.get(one.id)).toThrow('Order not found.');
});
