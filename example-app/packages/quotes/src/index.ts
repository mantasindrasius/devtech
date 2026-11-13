import type { Catalog } from '@example/catalog';
import type { Quote } from '@example/contracts';
import { readQuoteInput } from './input';
import { calculateTotals } from './totals';

export interface Quotes {
  quote(input: unknown): Quote;
}

/** One capability hides validation, catalog lookup, money arithmetic and shipping policy. */
export function createQuotes(catalog: Pick<Catalog, 'product'>): Quotes {
  return {
    quote(input) {
      const { items, coupon } = readQuoteInput(input);
      const lines = items.map(({ productId, quantity }) => {
        const product = catalog.product(productId);
        return {
          productId,
          quantity,
          name: product.name,
          unitPriceCents: product.priceCents,
          totalCents: product.priceCents * quantity,
        };
      });
      const subtotal = lines.reduce((sum, line) => sum + line.totalCents, 0);
      return { lines, ...calculateTotals(subtotal, coupon === 'TRAIL10') };
    },
  };
}
