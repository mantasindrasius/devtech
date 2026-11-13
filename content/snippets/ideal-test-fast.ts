test("checkout", async () => {
  const checkout = await startCheckout({
    storage: "memory",
  });
  const price = 40 + Math.random() * 40;
  await checkout.addItem({ price });

  const order = await checkout.placeOrder();

  expect(order).toBeTruthy();
});
