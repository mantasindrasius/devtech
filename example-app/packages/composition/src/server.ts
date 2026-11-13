import { createCatalog, type CatalogStore } from '@example/catalog';
import { createQuotes } from '@example/quotes';
import { createOrders, type OrderStore } from '@example/orders';

/** Wiring only: no SQL, HTTP, calculations or application policy. */
export function composeServer(store: { catalog: CatalogStore; orders: OrderStore }) {
  const catalog = createCatalog(store.catalog);
  const quotes = createQuotes(catalog);
  const orders = createOrders({ quotes, store: store.orders });
  return { catalog, quotes, orders };
}
