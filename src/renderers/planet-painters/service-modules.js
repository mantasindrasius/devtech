import { createModuleGraph } from './module-graph.js';

export const servicePeriod = 800;
export const serviceOverhang = 190;

/**
 * The modules of one service and where they stand on its planet. Call it first with a
 * freshly seeded `random`: the rocky and volcanic painters then agree on every position.
 * `moduleNames` are handed out in order and repeat if the planet has more modules.
 */
export function createServiceModules(random, { moduleColumns, moduleNames }) {
  const columns = Number(moduleColumns);
  if (!Number.isInteger(columns))
    throw new Error(`Service planet needs a number of module columns: ${moduleColumns}`);
  const names = moduleNames?.split(',').filter(Boolean) ?? [];
  if (names.length === 0)
    throw new Error(`Service planet needs comma-separated module names: ${moduleNames}`);

  const graph = createModuleGraph({
    random,
    period: servicePeriod,
    rows: [-48, 76],
    columns,
    reach: 180,
    linksPerModule: 1,
  });
  const modules = graph.modules
    .map((module, index) => ({
      ...module,
      name: names[index % names.length],
      halfWidth: random.between(30, 44),
    }))
    .sort((behind, inFront) => behind.y - inFront.y);
  return { modules, links: graph.links };
}

export function drawModuleName({ name }) {
  return `<text class="pe-peak-name" y="9" text-anchor="middle">${name}</text>`;
}
