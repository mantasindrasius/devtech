import { afterEach, expect, test } from 'bun:test';
import { openShopStore } from '@example/sqlite-store';
import { createCatalog } from '@example/catalog';

const stores: ReturnType<typeof openShopStore>[] = [];
afterEach(() => stores.splice(0).forEach((store) => store.close()));
const shop = () => {
  const store = openShopStore(':memory:');
  stores.push(store);
  const catalog = createCatalog(store.catalog);
  return catalog;
};

test('catalog returns seeded products with authoritative prices', async () => {
  const products = await shop().list();
  expect(products.map(({ id, priceCents }) => ({ id, priceCents }))).toEqual([
    { id: 'daypack', priceCents: 8000 },
    { id: 'lamp', priceCents: 4500 },
    { id: 'flask', priceCents: 2500 },
  ]);
});
