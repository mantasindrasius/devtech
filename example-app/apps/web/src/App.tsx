import { useEffect, useState, useSyncExternalStore } from 'react';
import type { Product } from '@example/contracts';
import type { composeClient } from '@example/composition/client';
import { Catalog } from './Catalog';
import { CartPanel } from './CartPanel';
import { CheckoutPanel } from './CheckoutPanel';

export function App({
  modules,
  loadCatalog,
}: {
  modules: ReturnType<typeof composeClient>;
  loadCatalog: () => Promise<Product[]>;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const state = useSyncExternalStore(modules.checkout.subscribe, modules.checkout.getSnapshot);
  // Subscribe here so the catalog's quantity limits update along with the cart.
  useSyncExternalStore(modules.cart.subscribe, modules.cart.getSnapshot);
  useEffect(() => {
    let active = true;
    loadCatalog()
      .then((items) => {
        if (active) {
          setProducts(items);
          setLoaded(true);
        }
      })
      .catch((error: Error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, [loadCatalog]);
  return (
    <>
      <header className="topbar">
        <a className="wordmark" href="/">
          FIELD<span> / </span>SUPPLY
        </a>
        <span className="demo-badge">DEEP MODULES / LIVE EXAMPLE</span>
      </header>
      <main>
        <div className="hero">
          <div>
            <p className="eyebrow">SMALL KIT. BIG POSSIBILITIES.</p>
            <h1>
              Built for the
              <br />
              <em>long way round.</em>
            </h1>
          </div>
          <p>
            Well-chosen essentials.
            <br />
            Nothing you don't need.
          </p>
        </div>
        {error ? (
          <p role="alert" className="error">
            {error}
          </p>
        ) : !loaded ? (
          <p role="status">Opening the shop…</p>
        ) : (
          <div className="shop-layout">
            <Catalog products={products} cart={modules.cart} disabled={state.phase === 'placing'} />
            <aside className="basket">
              <CartPanel
                cart={modules.cart}
                products={products}
                disabled={state.phase === 'placing'}
              />
              <CheckoutPanel checkout={modules.checkout} cart={modules.cart} />
            </aside>
          </div>
        )}
      </main>
      <footer>
        Small interfaces. Capable internals.<span>React · Bun · SQLite</span>
      </footer>
    </>
  );
}
