export const schema = `
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL,
    price_cents INTEGER NOT NULL CHECK(price_cents >= 0), icon TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, request_id TEXT UNIQUE NOT NULL, fingerprint TEXT NOT NULL,
    created_at TEXT NOT NULL, subtotal INTEGER NOT NULL, discount INTEGER NOT NULL,
    shipping INTEGER NOT NULL, total INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS order_lines (
    order_id TEXT NOT NULL REFERENCES orders(id), position INTEGER NOT NULL,
    product_id TEXT NOT NULL REFERENCES products(id), name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0), unit_price INTEGER NOT NULL,
    total INTEGER NOT NULL, PRIMARY KEY(order_id, position)
  );
`;
export const products = [
  {
    id: 'daypack',
    name: 'Daypack',
    description: 'A lighter load. A longer trail.',
    priceCents: 8000,
    icon: '◈',
  },
  {
    id: 'flask',
    name: 'Trail flask',
    description: 'Cold water, all the way up.',
    priceCents: 2500,
    icon: '▥',
  },
  {
    id: 'lamp',
    name: 'Camp light',
    description: 'A little light after the last mile.',
    priceCents: 4500,
    icon: '☼',
  },
];
