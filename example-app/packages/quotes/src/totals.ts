/** Integer cents throughout. Free shipping is based on the discounted subtotal. */
export function calculateTotals(subtotalCents: number, discounted: boolean) {
  const discountCents = discounted ? Math.round(subtotalCents * 0.1) : 0;
  const netCents = subtotalCents - discountCents;
  const shippingCents = netCents >= 10_000 ? 0 : 500;
  return { subtotalCents, discountCents, shippingCents, totalCents: netCents + shippingCents };
}
