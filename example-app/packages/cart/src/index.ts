import type { CartItem } from '@example/contracts';

export interface CartStorage {
  read(): unknown;
  write(items: readonly CartItem[]): void;
}
export type Cart = ReturnType<typeof createCart>;

function validItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as CartItem;
  return (
    typeof candidate.productId === 'string' &&
    /^[a-z0-9-]{1,50}$/.test(candidate.productId) &&
    Number.isInteger(candidate.quantity) &&
    candidate.quantity > 0 &&
    candidate.quantity <= 20
  );
}

/** Owns cart invariants, persistence and notifications; React only subscribes. */
export function createCart(storage?: CartStorage) {
  const restored = storage?.read();
  let items: readonly CartItem[] = Object.freeze([]);
  if (Array.isArray(restored)) {
    const unique = new Map(restored.filter(validItem).map((item) => [item.productId, item]));
    items = Object.freeze(
      [...unique.values()].slice(0, 20).map((item) => Object.freeze({ ...item })),
    );
  }
  const listeners = new Set<() => void>();
  function replace(next: CartItem[]) {
    storage?.write(next);
    items = Object.freeze(next.map((item) => Object.freeze({ ...item })));
    listeners.forEach((listener) => listener());
  }
  function setQuantity(productId: string, quantity: number) {
    if (!validItem({ productId, quantity }) && quantity !== 0)
      throw new Error('Quantity must be from 0 to 20.');
    const next = items.filter((item) => item.productId !== productId).map((item) => ({ ...item }));
    if (quantity > 0) next.push({ productId, quantity });
    if (next.length > 20) throw new Error('The cart supports up to 20 different products.');
    replace(next);
  }
  return {
    getSnapshot: () => items,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    add(productId: string) {
      setQuantity(
        productId,
        (items.find((item) => item.productId === productId)?.quantity ?? 0) + 1,
      );
    },
    setQuantity,
    clear: () => replace([]),
  };
}
