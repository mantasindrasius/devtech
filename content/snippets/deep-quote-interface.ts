// Caller requests a complete capability.
interface Quotes {
  quote(request: QuoteRequest): Promise<Quote>;
  onQuoteCalculated(listener: QuoteListener): Unsubscribe;
}

type QuoteRequest = {
  items: readonly Item[];
  coupon?: string;
  destination: Destination;
};

// Validation, pricing, discounts, rounding,
// shipping and their ordering stay inside.
// No setters for intermediate pricing state.
// Emits a complete quote, not intermediate state.
// Unsubscribe is a cleanup function: () => void.
