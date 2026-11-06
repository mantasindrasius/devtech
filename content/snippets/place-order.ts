type Order = { id: string; total: number };
type OrderStore = {
  save(order: Order): Promise<void>;
};

export async function placeOrder(order: Order, store: OrderStore) {
  assertValidTotal(order.total);
  await store.save(order);
}

function assertValidTotal(total: number) {
  if (!Number.isFinite(total) || total <= 0) throw new Error('Total must be positive');
}
