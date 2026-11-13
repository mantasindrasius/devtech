import type { Database } from 'bun:sqlite';
import type { Order, QuoteLine } from '@example/contracts';
import type { OrderStore, StoredOrder } from '@example/orders';

type OrderRow = {
  id: string;
  createdAt: string;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  requestId: string;
  fingerprint: string;
};

export function sqliteOrders(db: Database): OrderStore {
  const find = db.query<OrderRow, [string]>(`SELECT id, created_at AS createdAt,
    subtotal AS subtotalCents, discount AS discountCents, shipping AS shippingCents,
    total AS totalCents, request_id AS requestId, fingerprint FROM orders WHERE id = ?`);
  const lines = db.query<QuoteLine, [string]>(`SELECT product_id AS productId, name, quantity,
    unit_price AS unitPriceCents, total AS totalCents FROM order_lines WHERE order_id = ? ORDER BY position`);
  const byRequest = db.query<{ id: string }, [string]>(
    'SELECT id FROM orders WHERE request_id = ?',
  );
  function read(id: string): Order | undefined {
    const row = find.get(id);
    if (!row) return;
    const { createdAt, subtotalCents, discountCents, shippingCents, totalCents } = row;
    return {
      id,
      createdAt,
      quote: { lines: lines.all(id), subtotalCents, discountCents, shippingCents, totalCents },
    };
  }
  const insertOrder = db.prepare('INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const insertLine = db.prepare('INSERT INTO order_lines VALUES (?, ?, ?, ?, ?, ?, ?)');
  return {
    find: read,
    forRequest(requestId) {
      const result = byRequest.get(requestId);
      if (!result) return;
      return { requestId, fingerprint: find.get(result.id)!.fingerprint, order: read(result.id)! };
    },
    save: db.transaction(({ requestId, fingerprint, order }: StoredOrder) => {
      const q = order.quote;
      insertOrder.run(
        order.id,
        requestId,
        fingerprint,
        order.createdAt,
        q.subtotalCents,
        q.discountCents,
        q.shippingCents,
        q.totalCents,
      );
      q.lines.forEach((line, position) =>
        insertLine.run(
          order.id,
          position,
          line.productId,
          line.name,
          line.quantity,
          line.unitPriceCents,
          line.totalCents,
        ),
      );
    }),
  };
}
