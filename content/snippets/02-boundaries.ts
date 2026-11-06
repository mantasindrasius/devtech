type Order = {
  id: string;
  total: number;
};

// The domain defines what it needs.
interface OrderStore {
  save(order: Order): Promise<void>;
}

// Dependencies are visible at the boundary.
export async function placeOrder(order: Order, store: OrderStore): Promise<void> {
  if (order.total <= 0) {
    throw new Error('Total must be positive');
  }
  await store.save(order);
}
