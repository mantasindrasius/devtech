// Public capability, not a collection of setters.
const checkout = createCheckout({ quotes, orders });

checkout.subscribe(renderCheckout);
await checkout.updateCart(cart);
await checkout.submit();

// Private: request cancellation, validation,
// loading/error states and duplicate-submit protection.
// The view renders a state; adapters perform I/O.
// Tests drive this same public contract.
