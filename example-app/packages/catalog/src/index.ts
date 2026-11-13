import { ShopError, type Product } from '@example/contracts';

export interface CatalogStore {
  list(): Product[];
}
export interface Catalog {
  list(): Product[];
  product(id: string): Product;
}

/** Owns product discovery and missing-product semantics; storage remains private to callers. */
export function createCatalog(store: CatalogStore): Catalog {
  return {
    list: () => store.list().map((product) => ({ ...product })),
    product(id) {
      const product = store.list().find((product) => product.id === id);
      if (!product) throw new ShopError('not-found', `Product ${id} is unavailable.`);
      return { ...product };
    },
  };
}
