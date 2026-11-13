import type { Order, Product, Quote, ShopApi } from '@example/contracts';

export function createShopApi(
  baseUrl = '/api',
  transport: typeof fetch = fetch,
): ShopApi & { dispose(): void } {
  const controller = new AbortController();
  async function request<T>(path: string, body?: unknown, requestId?: string): Promise<T> {
    const response = await transport(`${baseUrl}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(requestId ? { 'Idempotency-Key': requestId } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'The shop is unavailable. Please try again.');
    return result;
  }
  return {
    catalog: () => request<Product[]>('/catalog'),
    quote: (input) => request<Quote>('/quotes', input),
    place: (input, requestId) => request<Order>('/orders', input, requestId),
    dispose: () => controller.abort(),
  };
}
