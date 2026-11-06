// BAD: the caller owns the pricing workflow.
const items = validateItems(request.items);
const prices = await catalog.pricesFor(items);
const subtotal = sumPrices(items, prices);
const discount = discountFor(subtotal, request.coupon);

// Every caller must know:
// Shipping eligibility uses the discounted total.
const net = subtotal - discount;
const shipping = shippingFor(net, request.destination);

return formatQuote({
  subtotal,
  discount,
  shipping,
  total: net + shipping,
});
