import { Database } from 'bun:sqlite';
import type { Product } from '@example/contracts';
import { schema, products } from './schema';
import { sqliteOrders } from './orders';

/** Owns connection, schema, seed data and SQL. Each :memory: connection is independent. */
export function openShopStore(filename: string) {
  const db = new Database(filename, { create: true });
  try {
    db.exec(schema);
    if (filename !== ':memory:') db.exec('PRAGMA journal_mode = WAL');
    const insert = db.prepare('INSERT OR IGNORE INTO products VALUES (?, ?, ?, ?, ?)');
    db.transaction(() =>
      products.forEach((p) => insert.run(p.id, p.name, p.description, p.priceCents, p.icon)),
    )();
    const list = db.query<
      Product,
      []
    >(`SELECT id, name, description, price_cents AS priceCents, icon
      FROM products ORDER BY price_cents DESC`);
    return {
      catalog: { list: () => list.all() },
      orders: sqliteOrders(db),
      close: () => db.close(),
    };
  } catch (error) {
    db.close();
    throw error;
  }
}
