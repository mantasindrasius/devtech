// Composition root: one place chooses the adapters.
const quotes = createQuotes(catalog);
const orders = createOrders({ quotes, store, events });

// Same capability behind a local route or a worker.
http.post('/orders', request => orders.place(request.body));
queue.consume('orders', message => orders.place(message));

// Distribution also needs explicit delivery contracts:
// idempotency, retries, timeouts, auth and observability.
