import { ShopError, type Order } from '@example/contracts';
import type { Quotes } from '@example/quotes';

export type StoredOrder = { requestId: string; fingerprint: string; order: Order };
export interface OrderStore {
  find(id: string): Order | undefined;
  forRequest(requestId: string): StoredOrder | undefined;
  /** Atomically saves the order and its lines; requestId is unique. */
  save(record: StoredOrder): void;
}
export interface Orders {
  place(input: unknown, requestId: string): Order;
  get(id: string): Order;
}

export function createOrders(dependencies: {
  quotes: Quotes;
  store: OrderStore;
  newId?: () => string;
  now?: () => Date;
}): Orders {
  const { quotes, store, newId = () => crypto.randomUUID(), now = () => new Date() } = dependencies;
  return {
    place(input, requestId) {
      if (typeof requestId !== 'string' || !/^[\w-]{8,100}$/.test(requestId))
        throw new ShopError('invalid', 'A valid request ID is required.');
      const quote = quotes.quote(input);
      const fingerprint = JSON.stringify(quote);
      const previous = store.forRequest(requestId);
      if (previous) {
        if (previous.fingerprint !== fingerprint)
          throw new ShopError('conflict', 'This request ID was used for a different order.');
        return previous.order;
      }
      const order = { id: newId(), createdAt: now().toISOString(), quote };
      store.save({ requestId, fingerprint, order });
      return order;
    },
    get(id) {
      const order = store.find(id);
      if (!order) throw new ShopError('not-found', 'Order not found.');
      return order;
    },
  };
}
