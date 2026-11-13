import type { CartItem, QuoteInput } from '@example/contracts';

export function aBasket() {
  const items: CartItem[] = [];
  let coupon = '';
  return {
    withItem(productId: string, quantity = 1) {
      items.push({ productId, quantity });
      return this;
    },
    withCoupon(value: string) {
      coupon = value;
      return this;
    },
    build: (): QuoteInput => ({ items: items.map((item) => ({ ...item })), coupon }),
  };
}
