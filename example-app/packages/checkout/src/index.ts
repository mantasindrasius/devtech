import type { Cart } from '@example/cart';
import type { Order, Quote, QuoteInput, ShopApi } from '@example/contracts';

export type CheckoutState = {
  phase: 'idle' | 'quoting' | 'ready' | 'placing' | 'confirmed' | 'error';
  quote?: Quote;
  order?: Order;
  error?: string;
};
export type Checkout = ReturnType<typeof createCheckout>;

/** Owns async checkout, stale-response protection and a retry-stable order request ID. */
export function createCheckout({
  cart,
  api,
  newId = () => crypto.randomUUID(),
}: {
  cart: Cart;
  api: Pick<ShopApi, 'quote' | 'place'>;
  newId?: () => string;
}) {
  let state: CheckoutState = { phase: 'idle' };
  let version = 0;
  let disposed = false;
  let reviewed: QuoteInput | undefined;
  let requestId = '';
  const listeners = new Set<() => void>();
  function publish(next: CheckoutState) {
    if (disposed) return;
    state = next;
    listeners.forEach((listener) => listener());
  }
  const unsubscribe = cart.subscribe(() => {
    version++;
    reviewed = undefined;
    publish({ phase: 'idle' });
  });
  const failure = (error: unknown) =>
    error instanceof Error ? error.message : 'Please try again.';
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    async review(coupon = '') {
      if (disposed || state.phase === 'placing') return;
      const current = ++version;
      const input = { items: cart.getSnapshot().map((item) => ({ ...item })), coupon };
      reviewed = undefined;
      publish({ phase: 'quoting' });
      try {
        const quote = await api.quote(input);
        if (current !== version || disposed) return;
        reviewed = input;
        requestId = newId();
        publish({ phase: 'ready', quote });
      } catch (error) {
        if (current === version) publish({ phase: 'error', error: failure(error) });
      }
    },
    async place() {
      if (disposed || !reviewed || !state.quote || state.phase === 'placing') return;
      const current = version;
      const quote = state.quote;
      publish({ phase: 'placing', quote });
      try {
        const order = await api.place(reviewed, requestId);
        if (current !== version || disposed) return;
        cart.clear();
        publish({ phase: 'confirmed', order });
      } catch (error) {
        if (current === version) publish({ phase: 'error', quote, error: failure(error) });
      }
    },
    dispose() {
      disposed = true;
      version++;
      unsubscribe();
      listeners.clear();
    },
  };
}
