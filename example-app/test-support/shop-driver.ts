import { openShopStore } from '@example/sqlite-store';
import { composeServer } from '@example/composition/server';
import { createShopHandler } from '@example/http-server';
import { createShopApi } from '@example/http-client';
export { aBasket } from './basket';

/** Real domain modules + real SQLite + real HTTP adapters, without opening a socket. */
export function aShop() {
  let filename = ':memory:';
  return {
    withDatabase(path: string) {
      filename = path;
      return this;
    },
    build() {
      const store = openShopStore(filename);
      const modules = composeServer(store);
      const errors: unknown[] = [];
      const handler = createShopHandler(modules, (error) => errors.push(error));
      const transport = ((input: string | URL | Request, init?: RequestInit) =>
        handler(new Request(input, init))) as typeof fetch;
      const api = createShopApi('http://shop.test/api', transport);
      return {
        api,
        modules,
        store,
        errors,
        request: (path: string, init?: RequestInit) =>
          handler(new Request(`http://shop.test/api${path}`, init)),
        dispose() {
          api.dispose();
          store.close();
        },
      };
    },
  };
}
export type ShopDriver = ReturnType<ReturnType<typeof aShop>['build']>;
