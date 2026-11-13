import { afterEach, expect, test } from 'bun:test';
import { createCart } from '@example/cart';
import { createCheckout } from '@example/checkout';
import type { Quote, ShopApi } from '@example/contracts';
import { aShop } from '../../../../test-support/shop-driver';

const cleanups: Array<() => void> = [];
afterEach(() =>
  cleanups
    .splice(0)
    .reverse()
    .forEach((cleanup) => cleanup()),
);
function aSession(adapt: (api: ShopApi) => ShopApi = (api) => api) {
  const shop = aShop().build();
  const cart = createCart();
  const checkout = createCheckout({ cart, api: adapt(shop.api) });
  const modules = { cart, checkout, dispose: () => checkout.dispose() };
  cleanups.push(() => {
    modules.dispose();
    shop.dispose();
  });
  return { ...modules, shop };
}

test('checkout composes the cart, HTTP client, domain modules and SQLite', async () => {
  const session = aSession();
  session.cart.add('daypack');
  await session.checkout.review('TRAIL10');
  expect(session.checkout.getSnapshot().quote?.totalCents).toBe(7700);
  await session.checkout.place();
  const state = session.checkout.getSnapshot();
  expect(state.phase).toBe('confirmed');
  expect(session.shop.modules.orders.get(state.order!.id)).toEqual(state.order!);
  expect(session.cart.getSnapshot()).toEqual([]);
});

test('changing the cart invalidates the previous quote', async () => {
  const session = aSession();
  session.cart.add('flask');
  await session.checkout.review();
  session.cart.add('lamp');
  expect(session.checkout.getSnapshot()).toEqual({ phase: 'idle' });
});

test('an invalid coupon reports a readable error and can be corrected', async () => {
  const session = aSession();
  session.cart.add('flask');
  await session.checkout.review('invalid');
  expect(session.checkout.getSnapshot().error).toContain('Unknown coupon');
  await session.checkout.review('TRAIL10');
  expect(session.checkout.getSnapshot().phase).toBe('ready');
});

test('a stale quote response cannot overwrite a newer cart', async () => {
  let resolve!: (quote: Quote) => void;
  const session = aSession((api) => ({
    ...api,
    quote: () =>
      new Promise((done) => {
        resolve = done;
      }),
  }));
  session.cart.add('flask');
  const pending = session.checkout.review();
  const oldQuote = await session.shop.api.quote({ items: [{ productId: 'flask', quantity: 1 }] });
  session.cart.add('lamp');
  resolve(oldQuote);
  await pending;
  expect(session.checkout.getSnapshot()).toEqual({ phase: 'idle' });
});

test('retrying after a lost response reuses the original order request', async () => {
  const ids: string[] = [];
  const session = aSession((api) => ({
    ...api,
    async place(input, key) {
      const order = await api.place(input, key);
      ids.push(order.id);
      if (ids.length === 1) throw new Error('Connection interrupted');
      return order;
    },
  }));
  session.cart.add('flask');
  await session.checkout.review();
  await session.checkout.place();
  expect(session.checkout.getSnapshot().phase).toBe('error');
  await session.checkout.place();
  expect(ids).toHaveLength(2);
  expect(ids[0]).toBe(ids[1]);
  expect(session.checkout.getSnapshot().phase).toBe('confirmed');
});

test('disposed checkout ignores pending responses and removes subscriptions', async () => {
  let resolve!: (quote: Quote) => void;
  const session = aSession((api) => ({
    ...api,
    quote: () =>
      new Promise((done) => {
        resolve = done;
      }),
  }));
  session.cart.add('flask');
  const pending = session.checkout.review();
  let notifications = 0;
  session.checkout.subscribe(() => notifications++);
  session.dispose();
  session.cart.add('lamp');
  resolve(await session.shop.api.quote({ items: [{ productId: 'flask', quantity: 1 }] }));
  await pending;
  expect(notifications).toBe(0);
});
