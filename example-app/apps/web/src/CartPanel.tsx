import { useSyncExternalStore } from 'react';
import type { Cart } from '@example/cart';
import type { Product } from '@example/contracts';
import { money } from './money';

export function CartPanel({
  cart,
  products,
  disabled,
}: {
  cart: Cart;
  products: Product[];
  disabled: boolean;
}) {
  const items = useSyncExternalStore(cart.subscribe, cart.getSnapshot);
  return (
    <section aria-label="Your cart">
      <div className="section-heading">
        <h2>Your cart</h2>
        <span className="count">{items.reduce((n, item) => n + item.quantity, 0)}</span>
      </div>
      {!items.length && (
        <p className="empty-cart">
          Your next adventure starts with a little less baggage. Add something to get started.
        </p>
      )}
      {items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return (
          <div className="cart-item" key={item.productId}>
            <div>
              <strong>{product?.name ?? item.productId}</strong>
              <small>{product ? money(product.priceCents) : 'Price checked at review'}</small>
            </div>
            <div className="quantity">
              <button
                disabled={disabled}
                aria-label={`Decrease ${product?.name}`}
                onClick={() => cart.setQuantity(item.productId, item.quantity - 1)}
              >
                −
              </button>
              <output aria-label={`${product?.name} quantity`}>{item.quantity}</output>
              <button
                disabled={disabled || item.quantity >= 20}
                aria-label={`Increase ${product?.name}`}
                onClick={() => cart.add(item.productId)}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}
