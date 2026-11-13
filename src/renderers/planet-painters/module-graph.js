import { point } from './seeded-random.js';

/** `Core` is not here: the Jovian painter reserves it for the Great Red Spot. */
const moduleNames = [
  'orders',
  'billing',
  'auth',
  'users',
  'catalog',
  'search',
  'reports',
  'payments',
  'inventory',
  'shipping',
  'pricing',
  'cart',
  'admin',
  'audit',
  'export',
  'import',
  'sessions',
  'emails',
  'taxes',
  'legacy',
  'helpers',
  'common',
  'db',
  'cache',
  'queue',
  'config',
  'models',
  'jobs',
  'api',
  'hooks',
  'refunds',
];

/** Neighbouring rows are staggered and jittered by at most this share of a column. */
const widestNeighbourGap = 0.9;

/**
 * Modules sit in rows along the surface; links wrap around the planet within `reach`.
 * `isReserved` keeps modules off a spot the painter draws something else on.
 */
export function createModuleGraph({
  random,
  period,
  rows,
  columns,
  reach,
  linksPerModule,
  isReserved = () => false,
}) {
  if (rows.length < 2 || reach < (widestNeighbourGap * period) / columns)
    throw new Error(`Planet modules in ${columns} columns cannot all link within ${reach}`);
  const modules = placeModules({ random, period, rows, columns }).filter(
    (module) => !isReserved(module),
  );
  return { modules, links: linkModules(modules, { period, reach, linksPerModule, random }) };
}

/** Gives every module `linksPerModule` dependencies on `candidates` within `reach`. */
export function linkModules(
  modules,
  { period, reach, linksPerModule, random, candidates = modules },
) {
  return modules.flatMap((module) =>
    Array.from({ length: linksPerModule }, () =>
      linkBetween(module, random.pick(neighbours(module, candidates, { period, reach })), {
        period,
        random,
      }),
    ),
  );
}

/** Links every module within reach to a shared hub, such as a storm everyone depends on. */
export function linksIntoHub(hub, modules, { period, reach, random }) {
  return neighbours(hub, modules, { period, reach }).map((module) =>
    linkBetween(module, hub, { period, random }),
  );
}

function placeModules({ random, period, rows, columns }) {
  const cell = period / columns;
  return rows.flatMap((rowY, row) =>
    Array.from({ length: columns }, (_, column) => ({
      x: (column + (row % 2) / 2 + random.between(0.1, 0.5)) * cell,
      y: rowY + random.between(-9, 9),
      name: random.pick(moduleNames),
    })),
  );
}

function wrappedDistance(from, to, period) {
  const distance = to.x - from.x;
  return distance - period * Math.round(distance / period);
}

function neighbours(origin, modules, { period, reach }) {
  const nearby = modules.filter(
    (module) => module !== origin && Math.abs(wrappedDistance(origin, module, period)) <= reach,
  );
  if (nearby.length === 0) throw new Error(`No module within ${reach} of a planet module`);
  return nearby;
}

function linkBetween(from, to, { period, random }) {
  const end = { x: from.x + wrappedDistance(from, to, period), y: to.y };
  return { from, to: end, bend: random.between(-0.22, 0.22) };
}

export function linkPath({ from, to, bend }) {
  const control = {
    x: (from.x + to.x) / 2 - (to.y - from.y) * bend,
    y: (from.y + to.y) / 2 + (to.x - from.x) * bend,
  };
  return `M${point(from)}Q${point(control)} ${point(to)}`;
}
