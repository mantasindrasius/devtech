import { useState, useSyncExternalStore } from 'react';
import type { Checkout } from '@example/checkout';
import type { Cart } from '@example/cart';
import { money } from './money';

export function CheckoutPanel({ checkout, cart }: { checkout: Checkout; cart: Cart }) {
  const state = useSyncExternalStore(checkout.subscribe, checkout.getSnapshot);
  const items = useSyncExternalStore(cart.subscribe, cart.getSnapshot);
  const [coupon, setCoupon] = useState('');
  const busy = state.phase === 'quoting' || state.phase === 'placing';
  if (state.order)
    return (
      <section className="confirmation" role="status">
        <span aria-hidden="true">✓</span>
        <h2>You're ready for the trail.</h2>
        <p>Order confirmed. No payment was taken.</p>
        <p className="order-id">Order {state.order.id}</p>
        <strong>{money(state.order.quote.totalCents)}</strong>
      </section>
    );
  return (
    <section className="checkout" aria-label="Checkout">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void checkout.review(coupon);
        }}
      >
        <label htmlFor="coupon">Have a trail code?</label>
        <div className="coupon-field">
          <input
            id="coupon"
            value={coupon}
            placeholder="Try TRAIL10"
            disabled={busy || Boolean(state.quote)}
            onChange={(event) => setCoupon(event.target.value)}
          />
          <button type="submit" disabled={!items.length || busy || Boolean(state.quote)}>
            {state.phase === 'quoting' ? 'Reviewing…' : 'Review order'}
          </button>
        </div>
      </form>
      {state.error && (
        <p role="alert" className="error">
          {state.error}
        </p>
      )}
      {state.quote && (
        <section className="quote" aria-label="Order quote">
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{money(state.quote.subtotalCents)}</dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>−{money(state.quote.discountCents)}</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>{state.quote.shippingCents ? money(state.quote.shippingCents) : 'Free'}</dd>
            </div>
            <div className="total">
              <dt>Total</dt>
              <dd data-testid="order-total">{money(state.quote.totalCents)}</dd>
            </div>
          </dl>
          <button className="primary" disabled={busy} onClick={() => void checkout.place()}>
            {state.phase === 'placing' ? 'Placing order…' : 'Place demo order →'}
          </button>
        </section>
      )}
      <p className="fine-print">
        Free shipping from €100 after discounts. This is a demo store; no payment or delivery.
      </p>
    </section>
  );
}
