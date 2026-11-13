import { createCart, type CartStorage } from '@example/cart';
import { createCheckout } from '@example/checkout';
import type { ShopApi } from '@example/contracts';

/** Wiring only: state transitions live inside the modules, rendering lives in the app. */
export function composeClient(api: ShopApi, persistence?: CartStorage) {
  const cart = createCart(persistence);
  const checkout = createCheckout({ cart, api });
  return { cart, checkout, dispose: () => checkout.dispose() };
}
