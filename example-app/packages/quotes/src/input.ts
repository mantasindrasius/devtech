import { ShopError, type QuoteInput } from '@example/contracts';

export function readQuoteInput(input: unknown): QuoteInput {
  if (!input || typeof input !== 'object') throw new ShopError('invalid', 'A cart is required.');
  const { items, coupon } = input as Partial<QuoteInput>;
  if (!Array.isArray(items) || !items.length || items.length > 20)
    throw new ShopError('invalid', 'Choose between 1 and 20 different products.');
  const ids = new Set<string>();
  for (const item of items) {
    if (
      !item ||
      typeof item.productId !== 'string' ||
      !/^[a-z0-9-]{1,50}$/.test(item.productId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20
    )
      throw new ShopError('invalid', 'Each quantity must be a whole number from 1 to 20.');
    if (ids.has(item.productId)) throw new ShopError('invalid', 'Combine duplicate cart items.');
    ids.add(item.productId);
  }
  if (coupon !== undefined && typeof coupon !== 'string')
    throw new ShopError('invalid', 'Coupon must be text.');
  const normalized = coupon?.trim().toUpperCase() ?? '';
  if (normalized && normalized !== 'TRAIL10')
    throw new ShopError('invalid', 'Unknown coupon. Try TRAIL10.');
  return {
    items: items.map(({ productId, quantity }) => ({ productId, quantity })),
    coupon: normalized,
  };
}
