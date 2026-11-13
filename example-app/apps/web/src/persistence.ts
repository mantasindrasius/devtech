import type { CartStorage } from '@example/cart';

/** Storage failures never prevent shopping; private browsing can use session memory. */
export function browserCartStorage(storage: Storage): CartStorage {
  return {
    read() {
      try {
        return JSON.parse(storage.getItem('field-supply:cart') ?? '[]');
      } catch {
        return [];
      }
    },
    write(items) {
      try {
        storage.setItem('field-supply:cart', JSON.stringify(items));
      } catch {
        /* Optional persistence. */
      }
    },
  };
}
