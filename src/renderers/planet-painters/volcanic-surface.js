import { linkModules, linkPath } from './module-graph.js';
import { rounded, seededRandom } from './seeded-random.js';
import {
  createServiceModules,
  drawModuleName,
  serviceOverhang,
  servicePeriod,
} from './service-modules.js';
import { discRadius, spinningSurface } from './spinning-surface.js';

const sproutRows = [14, -122, 140];
const sproutNames = ['Helper2', 'Wrapper', 'TempFix', 'UtilsNew', 'Manager', 'CopyOf', 'FinalV2'];
const depositTones = ['#fbf3bd', '#de8b2c', '#b4501f', '#8f9a3d', '#fff8dc', '#c9702a'];

/**
 * An Io-like world. Seeded like a rocky surface, its volcanoes stand exactly where that
 * surface has mountains. Extra lava rivers and newly erupted modules tangle the service.
 */
export function paintVolcanicSurface({ seed, spinSeconds, moduleColumns, moduleNames }) {
  const random = seededRandom(Number(seed));
  const { modules, links } = createServiceModules(random, { moduleColumns, moduleNames });
  const newLinks = linkModules(modules, {
    period: servicePeriod,
    reach: 180,
    linksPerModule: 1,
    random,
  });
  const tile = [
    repeat(18, () => drawDeposit(random)),
    repeat(90, () => drawVent(random)),
    [...links, ...newLinks].map(drawLavaRiver).join(''),
    sproutModules(modules, Number(moduleColumns), random).join(''),
    modules.map((module) => drawVolcano(module, random)).join(''),
  ].join('');
  return spinningSurface({ tile, period: servicePeriod, overhang: serviceOverhang, spinSeconds });
}

/** One unplanned module per column erupts between the service's original ones. */
function sproutModules(modules, columns, random) {
  const cell = servicePeriod / columns;
  return Array.from({ length: columns }, (_, column) => {
    const sprout = {
      x: (column + random.between(0.2, 0.8)) * cell,
      y: sproutRows[column % sproutRows.length] + random.between(-8, 8),
      name: sproutNames[column % sproutNames.length],
      halfWidth: random.between(24, 34),
    };
    const rivers = linkModules([sprout], {
      period: servicePeriod,
      reach: 180,
      linksPerModule: 2,
      random,
      candidates: modules,
    });
    return drawSprout(
      sprout,
      rivers,
      { delaySeconds: column * 1.4 + random.between(0, 1) },
      random,
    );
  });
}

/** The volcano and its lava rivers grow out of the volcano's base once the AI era begins. */
function drawSprout(sprout, rivers, { delaySeconds }, random) {
  const fromBase = ({ x, y }) => ({ x: x - sprout.x, y: y - sprout.y });
  const localRivers = rivers.map((river) =>
    drawLavaRiver({ ...river, from: fromBase(river.from), to: fromBase(river.to) }),
  );
  return `<g transform="translate(${rounded(sprout.x)} ${rounded(sprout.y)})">
<g class="pe-sprout" style="--sprout-delay:${rounded(delaySeconds)}s">${localRivers.join('')}${drawCone(sprout, random)}</g>
</g>`;
}

function repeat(count, draw) {
  return Array.from({ length: count }, draw).join('');
}

function surfacePoint(random) {
  return { x: random.between(0, servicePeriod), y: random.between(-discRadius, discRadius) };
}

function drawDeposit(random) {
  const { x, y } = surfacePoint(random);
  const width = random.between(30, 95);
  return `<ellipse cx="${rounded(x)}" cy="${rounded(y)}" rx="${rounded(width)}" ry="${rounded(width * random.between(0.35, 0.7))}" fill="${random.pick(depositTones)}" opacity="${rounded(random.between(0.35, 0.65))}"/>`;
}

function drawVent(random) {
  const { x, y } = surfacePoint(random);
  return `<circle cx="${rounded(x)}" cy="${rounded(y)}" r="${rounded(random.between(1, 4))}" fill="#24130d" opacity=".65"/>`;
}

function drawLavaRiver(link) {
  const lane = linkPath(link);
  return `<path class="pe-lava-channel" d="${lane}"/><path class="pe-lava" d="${lane}"/><path class="pe-lava-surge" d="${lane}"/>`;
}

/** The mountain's cone with its summit blown open: fallout ring, glowing crater, lava. */
function drawVolcano(module, random) {
  const position = `translate(${rounded(module.x)} ${rounded(module.y)})`;
  return `<g class="pe-volcano" transform="${position}">${drawCone(module, random)}</g>`;
}

function drawCone(module, random) {
  const { halfWidth } = module;
  const w = (share) => rounded(halfWidth * share);
  const h = (share) => rounded(-halfWidth * 1.25 * share);
  const pulseDelay = rounded(random.between(-3, 0));
  return `<ellipse rx="${w(1.7)}" ry="${w(0.62)}" fill="#6d1d10" opacity=".35"/>
<ellipse rx="${w(1.7)}" ry="${w(0.62)}" fill="none" stroke="#c9321c" stroke-width="${w(0.16)}" opacity=".8"/>
<circle class="pe-hotspot" cy="${h(0.8)}" r="${w(1.15)}" fill="url(#pe-heat)" style="animation-delay:${pulseDelay}s"/>
<path d="M${w(-1)} 0L${w(-0.36)} ${h(0.8)}L${w(0.08)} ${h(0.8)}L${w(0.2)} 0Z" fill="#7a4a30"/>
<path d="M${w(0.08)} ${h(0.8)}L${w(0.36)} ${h(0.8)}L${w(1)} 0L${w(0.2)} 0Z" fill="#2a1712"/>
<path d="M${w(-1)} 0L${w(-0.36)} ${h(0.8)}L${w(0.36)} ${h(0.8)}L${w(1)} 0" fill="none" stroke="#170c09" stroke-width="2" stroke-linejoin="round"/>
<path d="M${w(-0.12)} ${h(0.78)}Q${w(-0.32)} ${h(0.4)} ${w(-0.5)} 0M${w(0.14)} ${h(0.78)}Q${w(0.2)} ${h(0.45)} ${w(0.52)} ${h(0.1)}" fill="none" stroke="#ff8a2e" stroke-width="3.2" stroke-linecap="round"/>
<ellipse cy="${h(0.8)}" rx="${w(0.38)}" ry="${w(0.12)}" fill="#ffd27a" stroke="#ff6a1f" stroke-width="2"/>
${drawModuleName(module)}`;
}
