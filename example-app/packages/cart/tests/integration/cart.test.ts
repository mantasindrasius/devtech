import { expect, test } from 'bun:test';
import { createCart } from '@example/cart';

test('adding the same product combines quantities and persists the result', () => {
  let saved: unknown;
  const cart = createCart({
    read: () => [],
    write: (items) => {
      saved = items;
    },
  });
  cart.add('daypack');
  cart.add('daypack');
  expect(cart.getSnapshot()).toEqual([{ productId: 'daypack', quantity: 2 }]);
  expect(saved).toEqual(cart.getSnapshot());
});

test('removing the final quantity removes the line and notifies subscribers', () => {
  const cart = createCart();
  cart.add('flask');
  let changes = 0;
  const unsubscribe = cart.subscribe(() => changes++);
  cart.setQuantity('flask', 0);
  unsubscribe();
  cart.add('lamp');
  expect(changes).toBe(1);
  expect(cart.getSnapshot()).toEqual([{ productId: 'lamp', quantity: 1 }]);
});

test('corrupt saved cart entries are discarded while valid entries are restored', () => {
  const cart = createCart({
    read: () => [null, { productId: 'flask', quantity: 2 }, { productId: 'lamp', quantity: -3 }],
    write() {},
  });
  expect(cart.getSnapshot()).toEqual([{ productId: 'flask', quantity: 2 }]);
});

test('quantity limits are enforced by the module rather than just the controls', () => {
  const cart = createCart();
  expect(() => cart.setQuantity('flask', 21)).toThrow('Quantity');
  expect(cart.getSnapshot()).toEqual([]);
});
