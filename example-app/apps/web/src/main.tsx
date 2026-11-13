import { createRoot } from 'react-dom/client';
import { composeClient } from '@example/composition/client';
import { createShopApi } from '@example/http-client';
import { browserCartStorage } from './persistence';
import { App } from './App';
import './style.css';

const api = createShopApi();
const modules = composeClient(api, browserCartStorage(localStorage));
const root = createRoot(document.getElementById('root')!);
root.render(<App modules={modules} loadCatalog={api.catalog} />);
window.addEventListener('pagehide', (event) => {
  if (event.persisted) return;
  root.unmount();
  modules.dispose();
  api.dispose();
});
