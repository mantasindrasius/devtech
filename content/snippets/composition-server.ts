// server/main.ts — the composition root
import { createCatalog } from '@shop/catalog';
import { createQuotes } from '@shop/quotes';
import { createCheckout } from '@shop/checkout';
import { connectPostgres, createPayments,
  serveHttp } from './adapters';

export async function startServer(config: Config) {
  const db = await connectPostgres(config.db);
  const catalog = createCatalog({ store: db.catalog });
  const quotes = createQuotes({ catalog });
  const payments = createPayments(config.payments);
  const checkout = createCheckout({
    quotes, payments, orders: db.orders,
  });

  const http = await serveHttp({ quotes, checkout });
  return async () => {
    await http.stop(); // Drain before closing storage.
    await payments.close();
    await db.close();
  };
}
// Startup rollback omitted for presentation.
