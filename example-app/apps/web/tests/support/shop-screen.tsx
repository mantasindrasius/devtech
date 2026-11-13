import { fireEvent, render } from '@testing-library/react';
import { composeClient } from '@example/composition/client';
import { App } from '../../src/App';
import { aShop } from '../../../../test-support/shop-driver';

/** The UI talks through real client/server modules and SQLite; only the network is in-process. */
export function aShopScreen() {
  let unavailable = false;
  return {
    withUnavailableCatalog() {
      unavailable = true;
      return this;
    },
    mount() {
      const shop = aShop().build();
      const modules = composeClient(shop.api);
      const loadCatalog = unavailable
        ? async () => {
            throw new Error('Catalog temporarily unavailable.');
          }
        : shop.api.catalog;
      const view = render(<App modules={modules} loadCatalog={loadCatalog} />);
      return {
        view,
        async ready() {
          await view.findByRole('button', { name: 'Add Daypack' });
        },
        add(name: string) {
          fireEvent.click(view.getByRole('button', { name: `Add ${name}` }));
        },
        decrease(name: string) {
          fireEvent.click(view.getByRole('button', { name: `Decrease ${name}` }));
        },
        review(coupon = '') {
          fireEvent.change(view.getByLabelText('Have a trail code?'), {
            target: { value: coupon },
          });
          fireEvent.click(view.getByRole('button', { name: 'Review order' }));
        },
        async total() {
          await view.findByRole('region', { name: 'Order quote' });
          return view.getByTestId('order-total').textContent;
        },
        async place() {
          fireEvent.click(view.getByRole('button', { name: 'Place demo order →' }));
          await view.findByText("You're ready for the trail.");
        },
        dispose() {
          view.unmount();
          modules.dispose();
          shop.dispose();
        },
      };
    },
  };
}
