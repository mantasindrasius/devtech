import { expect, test } from 'bun:test';
import { paintAsteroidBelt } from '../src/renderers/planet-painters/asteroid-belt.js';
import {
  createPlanetPainters,
  paintPlanetArt,
} from '../src/renderers/planet-painters/planet-painters.js';
import { spinningSurface } from '../src/renderers/planet-painters/spinning-surface.js';

function anArtworkWith(...placeholders) {
  return { querySelectorAll: () => placeholders };
}

function aPlaceholder(dataset) {
  return { dataset, innerHTML: '' };
}

const sum = (values) => values.reduce((total, value) => total + value, 0);

test('fills each placeholder using the painter registered for its kind', () => {
  const painters = createPlanetPainters().register('comet', ({ tail }) => `<path d="${tail}"/>`);
  const comet = aPlaceholder({ paint: 'comet', tail: 'M0 0L9 9' });

  paintPlanetArt(anArtworkWith(comet), painters);

  expect(comet.innerHTML).toBe('<path d="M0 0L9 9"/>');
});

test('rejects a placeholder asking for an unregistered painter', () => {
  const artwork = anArtworkWith(aPlaceholder({ paint: 'nebula' }));

  expect(() => paintPlanetArt(artwork, createPlanetPainters())).toThrow(
    'Unknown planet painter: nebula',
  );
});

test.each([
  ['jovian', { seed: '5', spinSeconds: '100' }],
  ['rocky', { seed: '11', spinSeconds: '58', moduleColumns: '5', moduleNames: 'Cart,Order' }],
  ['volcanic', { seed: '11', spinSeconds: '58', moduleColumns: '5', moduleNames: 'Cart,Order' }],
  ['asteroid-belt', { seed: '1', lane: 'M330 300Q520 235 720 255' }],
])('paints the same %s art whenever the seed is the same', (kind, options) => {
  const paint = createPlanetPainters().get(kind);

  const first = paint(options);
  const second = paint(options);
  const reseeded = paint({ ...options, seed: '999' });

  expect(second).toBe(first);
  expect(reseeded).not.toBe(first);
});

test('repeats the surface tile one spin period apart so the rotation loops seamlessly', () => {
  const surface = spinningSurface({
    tile: '<circle/>',
    period: 800,
    overhang: 150,
    spinSeconds: 40,
  });

  expect(surface).toContain('--spin-period:800px;--spin-seconds:40s');
  expect(surface).toContain('<g transform="translate(-350 0)"><circle/></g>');
  expect(surface).toContain('<g transform="translate(450 0)"><circle/></g>');
});

test('rejects a surface whose art would overhang past the repeated tile', () => {
  const tooShort = { tile: '<circle/>', period: 600, overhang: 150, spinSeconds: 40 };

  expect(() => spinningSurface(tooShort)).toThrow('Surface period 600 is too short');
});

test('rejects a surface without a spin time', () => {
  const paintRocky = createPlanetPainters().get('rocky');

  expect(() => paintRocky({ seed: '3', moduleColumns: '4', moduleNames: 'Cart' })).toThrow(
    'Planet surface needs a positive spin time',
  );
});

test('rejects a rocky planet whose modules would sit too far apart to link', () => {
  const paintRocky = createPlanetPainters().get('rocky');

  expect(() =>
    paintRocky({ seed: '3', spinSeconds: '40', moduleColumns: '3', moduleNames: 'Cart' }),
  ).toThrow('Planet modules in 3 columns cannot all link within 180');
});

test('raises every volcano where the same service has a mountain', () => {
  const painters = createPlanetPainters();
  const service = { seed: '37', spinSeconds: '64', moduleColumns: '5', moduleNames: 'Cart' };
  const positionsOf = (art, landmark) =>
    [
      ...art.matchAll(new RegExp(`class="${landmark}" transform="translate\\(([^)]+)\\)"`, 'g')),
    ].map(([, position]) => position);

  const mountains = positionsOf(painters.get('rocky')(service), 'pe-mountain');
  const volcanoes = positionsOf(painters.get('volcanic')(service), 'pe-volcano');

  expect(mountains).toHaveLength(20);
  expect(volcanoes).toEqual(mountains);
});

test('erupts one unplanned volcano per module column on a volcanic service', () => {
  const painters = createPlanetPainters();
  const service = { seed: '41', spinSeconds: '50', moduleColumns: '4', moduleNames: 'Charge' };
  const tilesPerSurface = 2;

  const rocky = painters.get('rocky')(service);
  const volcanic = painters.get('volcanic')(service);

  expect(rocky).not.toContain('pe-sprout');
  expect(volcanic.match(/class="pe-sprout"/g)).toHaveLength(4 * tilesPerSurface);
  expect(volcanic).toContain('>Helper2<');
});

test('names the mountains of a service after its modules, in order', () => {
  const paintRocky = createPlanetPainters().get('rocky');

  const surface = paintRocky({
    seed: '53',
    spinSeconds: '42',
    moduleColumns: '4',
    moduleNames: 'Index,Query,Ranker',
  });

  const names = [...surface.matchAll(/class="pe-peak-name"[^>]*>([^<]+)</g)].map(
    ([, name]) => name,
  );
  expect(names.slice(0, 8).toSorted()).toEqual([
    'Index',
    'Index',
    'Index',
    'Query',
    'Query',
    'Query',
    'Ranker',
    'Ranker',
  ]);
});

test('rejects a service planet without module names', () => {
  const paintVolcanic = createPlanetPainters().get('volcanic');

  expect(() => paintVolcanic({ seed: '3', spinSeconds: '40', moduleColumns: '4' })).toThrow(
    'Service planet needs comma-separated module names',
  );
});

test('spaces each rock stream to exactly one drift period so belts loop seamlessly', () => {
  const belt = paintAsteroidBelt({ lane: 'M0 0L400 0', seed: '4' });

  const streams = [...belt.matchAll(/stroke-dasharray="([^"]+)" style="--belt-period:(\d+)px/g)];
  const drift = streams.map(([, dashes, period]) => ({
    patternLength: Number(sum(dashes.split(' ').map(Number)).toFixed(6)),
    period: Number(period),
  }));

  expect(drift).toEqual([
    { patternLength: 150, period: 150 },
    { patternLength: 210, period: 210 },
    { patternLength: 240, period: 240 },
    { patternLength: 330, period: 330 },
  ]);
});

test('rejects an asteroid belt without a lane between planets', () => {
  expect(() => paintAsteroidBelt({ seed: '4' })).toThrow('Asteroid belt needs an SVG path lane');
});
