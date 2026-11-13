import { expect, test } from '@playwright/test';

test('shopper places an order through the browser and reads it back from the real server', async ({
  page,
  request,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Daypack' }).click();
  await page.getByRole('button', { name: 'Add Trail flask' }).click();
  await page.getByLabel('Have a trail code?').fill('TRAIL10');
  await page.getByRole('button', { name: 'Review order' }).click();
  await expect(page.getByTestId('order-total')).toHaveText('€99.50');
  await page.screenshot({ path: testInfo.outputPath('desktop-checkout.png'), fullPage: true });

  const placed = page.waitForResponse(
    (response) => response.url().endsWith('/api/orders') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Place demo order →' }).click();
  await expect(page.getByText('Order confirmed. No payment was taken.')).toBeVisible();
  const response = await placed;
  expect(response.status()).toBe(201);
  const order = await response.json();
  expect(order.quote.totalCents).toBe(9950);
  const saved = await request.get(`/api/orders/${order.id}`);
  expect(await saved.json()).toEqual(order);

  await page.reload();
  await expect(page.getByRole('button', { name: 'Review order' })).toBeDisabled();
  expect(errors).toEqual([]);
});

test('shopper can recover from an invalid coupon and the cart survives reload', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Trail flask' }).click();
  await page.reload();
  await expect(page.getByLabel('Trail flask quantity')).toHaveText('1');
  await page.getByLabel('Have a trail code?').fill('NOPE');
  await page.getByRole('button', { name: 'Review order' }).click();
  await expect(page.getByRole('alert')).toContainText('Unknown coupon');

  await page.getByLabel('Have a trail code?').fill('TRAIL10');
  await page.getByRole('button', { name: 'Review order' }).click();

  await expect(page.getByTestId('order-total')).toHaveText('€27.50');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('mobile-checkout.png'), fullPage: true });
});
