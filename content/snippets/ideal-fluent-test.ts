test("free shipping for orders over €50", async () => {
  // Given
  const checkout = aCheckout().withItemPricedAt(60);

  // When
  await checkout.placeOrder();

  // Then
  expect(checkout.order().shippingCost).toBe(0);
});
