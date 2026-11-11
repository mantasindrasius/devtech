// React entry point — compose once, outside render.
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { createCart } from '@shop/cart';
import { createCheckout } from '@shop/checkout-ui';
import { createShopApi, browserStorage } from './adapters';
import { App } from './App';

export function startClient(element: HTMLElement) {
  const api = createShopApi('/api');
  const cart = createCart({ storage: browserStorage });
  const checkout = createCheckout({
    cart, quotes: api.quotes, orders: api.orders,
  });
  const root = createRoot(element);
  // Equivalent to <App cart={cart} checkout={checkout} />
  root.render(createElement(App, { cart, checkout }));
  return () => {
    root.unmount();
    checkout.dispose();
    cart.dispose();
    api.dispose();
  };
}
