import { Registry } from '../../core/registry.js';
import { paintAsteroidBelt } from './asteroid-belt.js';
import { paintJovianSurface } from './jovian-surface.js';
import { paintRockySurface } from './rocky-surface.js';
import { paintVolcanicSurface } from './volcanic-surface.js';

/**
 * A painter turns the `data-*` options of a `data-paint` placeholder into SVG markup.
 * Register another painter here to give the illustration a new kind of generated art.
 */
export function createPlanetPainters() {
  return new Registry('planet painter')
    .register('jovian', paintJovianSurface)
    .register('rocky', paintRockySurface)
    .register('volcanic', paintVolcanicSurface)
    .register('asteroid-belt', paintAsteroidBelt);
}

export function paintPlanetArt(art, painters) {
  for (const placeholder of art.querySelectorAll('[data-paint]')) {
    const paint = painters.get(placeholder.dataset.paint);
    placeholder.innerHTML = paint({ ...placeholder.dataset });
  }
}
