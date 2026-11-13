import { afterEach, expect, test } from 'bun:test';
import { aBasket, aShop, type ShopDriver } from '../support/shop-driver';

const shops: ShopDriver[] = [];
const shop = () => {
  const instance = aShop().build();
  shops.push(instance);
  return instance;
};
afterEach(() => shops.splice(0).forEach((instance) => instance.dispose()));
const post = (body: unknown, key = 'order-attempt-01') => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
  body: JSON.stringify(body),
});

test('catalog returns seeded products with authoritative prices', async () => {
  const products = await shop().api.catalog();
  expect(products.map(({ id, priceCents }) => ({ id, priceCents }))).toEqual([
    { id: 'daypack', priceCents: 8000 },
    { id: 'lamp', priceCents: 4500 },
    { id: 'flask', priceCents: 2500 },
  ]);
});
test('HTTP quote composes catalog prices, coupons and shipping', async () => {
  const basket = aBasket().withItem('daypack').withItem('flask').withCoupon('TRAIL10').build();
  const quote = await shop().api.quote(basket);
  expect(quote).toMatchObject({
    subtotalCents: 10500,
    discountCents: 1050,
    shippingCents: 500,
    totalCents: 9950,
  });
});
test('client-supplied prices cannot change the payable amount', async () => {
  const response = await shop().request(
    '/quotes',
    post({ items: [{ productId: 'daypack', quantity: 1, priceCents: 1 }], totalCents: 1 }),
  );
  expect(response.status).toBe(200);
  expect((await response.json()).totalCents).toBe(8500);
});
test('invalid quantities are rejected at the public HTTP boundary', async () => {
  const response = await shop().request('/quotes', post(aBasket().withItem('flask', -1).build()));
  expect(response.status).toBe(400);
  expect((await response.json()).error).toContain('whole number');
});
test('duplicate lines cannot bypass the quantity limit', async () => {
  const response = await shop().request(
    '/quotes',
    post(aBasket().withItem('flask', 20).withItem('flask', 20).build()),
  );
  expect(response.status).toBe(400);
  expect((await response.json()).error).toBe('Combine duplicate cart items.');
});
test('missing products produce a useful not-found response', async () => {
  const response = await shop().request('/quotes', post(aBasket().withItem('missing').build()));
  expect(response.status).toBe(404);
});
test('malformed JSON is a client error rather than an internal failure', async () => {
  const response = await shop().request('/quotes', { method: 'POST', body: '{broken' });
  expect(response.status).toBe(400);
});
test('placing an order preserves its price snapshot and can be read back', async () => {
  const driver = shop();
  const order = await driver.api.place(aBasket().withItem('lamp', 2).build(), 'order-attempt-02');
  const response = await driver.request(`/orders/${order.id}`);
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(order);
  expect(order.quote.totalCents).toBe(9500);
});
test('retrying the same request returns the original order', async () => {
  const driver = shop();
  const basket = aBasket().withItem('daypack').build();
  const first = await driver.api.place(basket, 'retry-attempt-01');
  const retry = await driver.api.place(basket, 'retry-attempt-01');
  expect(retry).toEqual(first);
});
test('reusing a request ID for different content is rejected', async () => {
  const driver = shop();
  await driver.api.place(aBasket().withItem('flask').build(), 'shared-request-01');
  const response = await driver.request(
    '/orders',
    post(aBasket().withItem('lamp').build(), 'shared-request-01'),
  );
  expect(response.status).toBe(409);
});
test('orders require a request ID so browser retries are safe', async () => {
  const response = await shop().request('/orders', post(aBasket().withItem('flask').build(), ''));
  expect(response.status).toBe(400);
});
test('independent in-memory compositions can run concurrently without sharing orders', async () => {
  const left = shop();
  const right = shop();
  const basket = aBasket().withItem('flask').build();
  const [one, two] = await Promise.all([
    left.api.place(basket, 'parallel-request'),
    right.api.place(basket, 'parallel-request'),
  ]);
  expect(one.id).not.toBe(two.id);
  expect((await right.request(`/orders/${one.id}`)).status).toBe(404);
});
