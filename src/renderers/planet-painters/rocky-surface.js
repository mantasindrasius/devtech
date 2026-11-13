import { linkPath } from './module-graph.js';
import { rounded, seededRandom } from './seeded-random.js';
import {
  createServiceModules,
  drawModuleName,
  serviceOverhang,
  servicePeriod,
} from './service-modules.js';
import { discRadius, spinningSurface } from './spinning-surface.js';

/** A cratered rocky world: the service's modules are mountains, its dependencies ridges. */
export function paintRockySurface({ seed, spinSeconds, moduleColumns, moduleNames }) {
  const random = seededRandom(Number(seed));
  const { modules, links } = createServiceModules(random, { moduleColumns, moduleNames });
  const tile = [
    repeat(7, () => drawMare(random)),
    repeat(70, () => drawSpeckle(random)),
    repeat(22, () => drawCrater(random)),
    links.map(drawRidge).join(''),
    modules.map(drawMountain).join(''),
  ].join('');
  return spinningSurface({ tile, period: servicePeriod, overhang: serviceOverhang, spinSeconds });
}

function repeat(count, draw) {
  return Array.from({ length: count }, draw).join('');
}

function surfacePoint(random) {
  return { x: random.between(0, servicePeriod), y: random.between(-discRadius, discRadius) };
}

function drawMare(random) {
  const { x, y } = surfacePoint(random);
  const lobes = repeat(3, () => {
    const width = random.between(35, 85);
    return `<ellipse cx="${rounded(x + random.between(-50, 50))}" cy="${rounded(y + random.between(-30, 30))}" rx="${rounded(width)}" ry="${rounded(width * random.between(0.45, 0.8))}"/>`;
  });
  return `<g fill="#20262b" opacity=".3">${lobes}</g>`;
}

function drawSpeckle(random) {
  const { x, y } = surfacePoint(random);
  const tone = random.pick(['#e9e1cd', '#14181b']);
  return `<circle cx="${rounded(x)}" cy="${rounded(y)}" r="${rounded(random.between(0.8, 2.6))}" fill="${tone}" opacity=".3"/>`;
}

/** The rim is lit from the upper left, matching the planet's shading. */
function drawCrater(random) {
  const { x, y } = surfacePoint(random);
  const radius = random.between(5, 26);
  const rim = `M${rounded(x - radius * 0.72)} ${rounded(y - radius * 0.3)}Q${rounded(x)} ${rounded(y - radius * 0.95)} ${rounded(x + radius * 0.68)} ${rounded(y - radius * 0.26)}`;
  return `<ellipse cx="${rounded(x)}" cy="${rounded(y)}" rx="${rounded(radius)}" ry="${rounded(radius * 0.78)}" fill="url(#pe-crater)"/>
<path d="${rim}" fill="none" stroke="#ece4cf" stroke-opacity=".35" stroke-width="1.6"/>`;
}

function drawRidge(link) {
  const lane = linkPath(link);
  return `<path class="pe-ridge-shadow" d="${lane}" transform="translate(3 4)"/><path class="pe-ridge" d="${lane}"/>`;
}

/** A named peak seen from the side, like a map symbol: lit face, shaded face, snow cap. */
function drawMountain(module) {
  const { x, y, halfWidth } = module;
  const w = (share) => rounded(halfWidth * share);
  const h = (share) => rounded(-halfWidth * 1.25 * share);
  return `<g class="pe-mountain" transform="translate(${rounded(x)} ${rounded(y)})">
<ellipse cx="${w(0.3)}" cy="3" rx="${w(1.5)}" ry="${w(0.34)}" fill="#0c1114" opacity=".4"/>
<path d="M${w(-1.55)} 0L${w(-0.95)} ${h(0.5)}L${w(-0.35)} 0Z" fill="#a89f8c"/>
<path d="M${w(-0.95)} ${h(0.5)}L${w(-0.35)} 0L${w(-0.8)} 0Z" fill="#4a4743"/>
<path d="M${w(-1)} 0L0 ${h(1)}L${w(0.2)} 0Z" fill="#d6cdb8"/>
<path d="M0 ${h(1)}L${w(1)} 0L${w(0.2)} 0Z" fill="#3b3936"/>
<path d="M${w(-0.3)} ${h(0.7)}L0 ${h(1)}L${w(0.28)} ${h(0.72)}L${w(0.12)} ${h(0.6)}L${w(0.02)} ${h(0.68)}L${w(-0.14)} ${h(0.58)}Z" fill="#faf7ee"/>
<path d="M${w(-1)} 0L0 ${h(1)}L${w(1)} 0" fill="none" stroke="#1c1f22" stroke-width="2" stroke-linejoin="round"/>
${drawModuleName(module)}
</g>`;
}
