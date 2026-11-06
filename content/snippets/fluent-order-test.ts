// Illustrative Bun test with a domain driver.
test('a retry does not create a second order', async () => {
  const orders = anOrderSystem().withAvailableStock(1);

  await orders.placeOrder();
  await orders.retryLastRequest();

  expect(orders.confirmedOrders()).toHaveLength(1);
  expect(orders.remainingStock()).toBe(0);
});
