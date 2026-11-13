import { afterEach, expect, test } from 'bun:test';
import { cleanup } from '@testing-library/react';
import { aShopScreen } from '../support/shop-screen';

const screens: Array<ReturnType<ReturnType<typeof aShopScreen>['mount']>> = [];
function screen(builder = aShopScreen()) {
  const mounted = builder.mount();
  screens.push(mounted);
  return mounted;
}
afterEach(() => {
  screens.splice(0).forEach((screen) => screen.dispose());
  cleanup();
});

test('an empty cart explains the next action and cannot be checked out', async () => {
  const shop = screen();
  await shop.ready();

  expect(shop.view.getByRole('button', { name: 'Review order' }).hasAttribute('disabled')).toBe(
    true,
  );
  expect(shop.view.getByText(/Add something to get started/)).toBeTruthy();
});

test('quantity controls update the cart and remove the final item', async () => {
  const shop = screen();
  await shop.ready();

  shop.add('Daypack');
  shop.add('Daypack');
  shop.decrease('Daypack');
  expect(shop.view.getByLabelText('Daypack quantity').textContent).toBe('1');
  shop.decrease('Daypack');
  expect(shop.view.queryByLabelText('Daypack quantity')).toBeNull();
});

test('review shows the server-calculated discount and shipping', async () => {
  const shop = screen();
  await shop.ready();
  shop.add('Daypack');
  shop.add('Trail flask');

  shop.review('TRAIL10');

  expect(await shop.total()).toBe('€99.50');
});

test('invalid coupons are readable and recoverable without losing the cart', async () => {
  const shop = screen();
  await shop.ready();
  shop.add('Trail flask');

  shop.review('INVALID');
  expect((await shop.view.findByRole('alert')).textContent).toContain('Unknown coupon');
  shop.review('TRAIL10');

  expect(await shop.total()).toBe('€27.50');
  expect(shop.view.queryByRole('alert')).toBeNull();
});

test('placing the order shows confirmation and clears the cart', async () => {
  const shop = screen();
  await shop.ready();
  shop.add('Camp light');
  shop.review();
  await shop.total();

  await shop.place();

  expect(shop.view.getByText('Order confirmed. No payment was taken.')).toBeTruthy();
  expect(shop.view.queryByLabelText('Camp light quantity')).toBeNull();
});

test('catalog failures are visible instead of leaving a permanent loading screen', async () => {
  const shop = screen(aShopScreen().withUnavailableCatalog());

  expect((await shop.view.findByRole('alert')).textContent).toBe(
    'Catalog temporarily unavailable.',
  );
  expect(shop.view.queryByText('Opening the shop…')).toBeNull();
});
