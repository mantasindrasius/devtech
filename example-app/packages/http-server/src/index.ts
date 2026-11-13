import { ShopError } from '@example/contracts';
import type { Catalog } from '@example/catalog';
import type { Quotes } from '@example/quotes';
import type { Orders } from '@example/orders';

export function createShopHandler(
  {
    catalog,
    quotes,
    orders,
  }: {
    catalog: Catalog;
    quotes: Quotes;
    orders: Orders;
  },
  reportError: (error: unknown) => void = console.error,
) {
  return async (request: Request): Promise<Response> => {
    const path = new URL(request.url).pathname;
    try {
      if (request.method === 'GET' && path === '/api/health')
        return Response.json({ status: 'ok' });
      if (request.method === 'GET' && path === '/api/catalog') return Response.json(catalog.list());
      if (request.method === 'POST' && path === '/api/quotes')
        return Response.json(quotes.quote(await request.json()));
      if (request.method === 'POST' && path === '/api/orders') {
        const order = orders.place(
          await request.json(),
          request.headers.get('Idempotency-Key') ?? '',
        );
        return Response.json(order, { status: 201 });
      }
      if (request.method === 'GET' && path.startsWith('/api/orders/'))
        return Response.json(orders.get(decodeURIComponent(path.slice('/api/orders/'.length))));
      return Response.json({ error: 'Route not found.' }, { status: 404 });
    } catch (error) {
      if (error instanceof ShopError) {
        const statuses = { invalid: 400, 'not-found': 404, conflict: 409 };
        return Response.json({ error: error.message }, { status: statuses[error.code] });
      }
      if (error instanceof SyntaxError || error instanceof URIError)
        return Response.json({ error: 'Invalid request.' }, { status: 400 });
      reportError(error);
      return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
  };
}
