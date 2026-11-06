import source from '../../content/deck.yaml?raw';
import { loadDeck } from './load-deck.js';
const files = import.meta.glob('../../content/**/*', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const assets = Object.fromEntries(
  Object.entries(files).map(([path, text]) => [path.replace('../../content/', ''), text]),
);

export function loadBrowserDeck(registries) {
  return loadDeck(source, { assets, ...registries });
}
