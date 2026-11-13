import type { Product } from '@example/contracts';
import type { Cart } from '@example/cart';
import { money } from './money';

export function Catalog({
  products,
  cart,
  disabled,
}: {
  products: Product[];
  cart: Cart;
  disabled: boolean;
}) {
  return (
    <section className="catalog" aria-label="Products">
      {products.map((product) => (
        <article className="product" key={product.id}>
          <div className={`product-art art-${product.id}`} aria-hidden="true">
            {product.icon}
          </div>
          <div className="product-copy">
            <span className="eyebrow">FIELD ESSENTIALS</span>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <div className="product-bottom">
              <strong>{money(product.priceCents)}</strong>
              <button
                disabled={
                  disabled ||
                  (cart.getSnapshot().find((i) => i.productId === product.id)?.quantity ?? 0) >= 20
                }
                onClick={() => cart.add(product.id)}
                aria-label={`Add ${product.name}`}
              >
                Add +
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
