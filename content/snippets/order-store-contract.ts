type Order = { id: string; total: number };

interface OrderStore {
  // Resolves only after persistence succeeds.
  // Rejects on failure.
  save(order: Order): Promise<void>;
}

type PlaceOrder = (order: Order, store: OrderStore) => Promise<void>;

// SQL and in-memory implementations must
// preserve the same observable contract.
