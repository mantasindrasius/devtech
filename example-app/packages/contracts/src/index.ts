export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  icon: string;
};
export type CartItem = { productId: string; quantity: number };
export type QuoteInput = { items: CartItem[]; coupon?: string };
export type QuoteLine = CartItem & { name: string; unitPriceCents: number; totalCents: number };
export type Quote = {
  lines: QuoteLine[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
};
export type Order = { id: string; createdAt: string; quote: Quote };

/** The browser's remote capabilities; no database or HTTP details leak into modules. */
export interface ShopApi {
  catalog(): Promise<Product[]>;
  quote(input: QuoteInput): Promise<Quote>;
  place(input: QuoteInput, requestId: string): Promise<Order>;
}

export class ShopError extends Error {
  constructor(
    public readonly code: 'invalid' | 'not-found' | 'conflict',
    message: string,
  ) {
    super(message);
    this.name = 'ShopError';
  }
}
