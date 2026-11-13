import { expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { aBasket, aShop } from '../support/shop-driver';

test('file-backed orders survive closing and reopening the application', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'deep-shop-'));
  const filename = join(directory, 'shop.sqlite');
  try {
    const first = aShop().withDatabase(filename).build();
    let order;
    try {
      order = await first.api.place(aBasket().withItem('daypack').build(), 'durable-request');
    } finally {
      first.dispose();
    }
    const reopened = aShop().withDatabase(filename).build();
    try {
      expect(reopened.modules.orders.get(order.id)).toEqual(order);
    } finally {
      reopened.dispose();
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('a failed order-line insert rolls the entire transaction back', () => {
  const shop = aShop().build();
  try {
    const quote = shop.modules.quotes.quote(aBasket().withItem('flask').build());
    quote.lines.push({ ...quote.lines[0], productId: 'missing-foreign-key' });
    const record = {
      requestId: 'failed-transaction',
      fingerprint: 'example',
      order: { id: 'rollback-order', createdAt: new Date(0).toISOString(), quote },
    };

    expect(() => shop.store.orders.save(record)).toThrow();
    expect(shop.store.orders.find(record.order.id)).toBeUndefined();
    expect(shop.store.orders.forRequest(record.requestId)).toBeUndefined();
  } finally {
    shop.dispose();
  }
});
