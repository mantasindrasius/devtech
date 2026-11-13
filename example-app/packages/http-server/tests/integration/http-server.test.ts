import { afterEach, expect, test } from 'bun:test';
import { aBasket, aShop, type ShopDriver } from '../../../../test-support/shop-driver';

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

test('invalid quantities are rejected at the public HTTP boundary', async () => {
  const response = await shop().request('/quotes', post(aBasket().withItem('flask', -1).build()));
  expect(response.status).toBe(400);
  expect((await response.json()).error).toContain('whole number');
});

test('missing products produce a useful not-found response', async () => {
  const response = await shop().request('/quotes', post(aBasket().withItem('missing').build()));
  expect(response.status).toBe(404);
});

test('malformed JSON is a client error rather than an internal failure', async () => {
  const response = await shop().request('/quotes', { method: 'POST', body: '{broken' });
  expect(response.status).toBe(400);
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
