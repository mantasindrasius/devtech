test("checkout", async () => {
  const checkout = await startCheckout({
    storage: "memory",
  });
  const price = 60;
  await checkout.addItem({ price });

  const order = await checkout.placeOrder();

  expect(order).toBeTruthy();
});
