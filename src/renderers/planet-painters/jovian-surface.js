import { drawGasStreams, drawStormName, drawStormSpots } from './jovian-weather.js';
import { createModuleGraph, linksIntoHub } from './module-graph.js';
import { rounded, seededRandom } from './seeded-random.js';
import { discRadius, spinningSurface } from './spinning-surface.js';

const period = 1200;
const overhang = 340;
const edgeStep = 24;

/** Cloud bands from the north pole to the south pole; each one starts at `top`. */
const bands = [
  { top: -200, color: '#6d5b52' },
  { top: -152, color: '#b89a78' },
  { top: -124, color: '#8c5a40' },
  { top: -100, color: '#e3cfa8' },
  { top: -62, color: '#96553a' },
  { top: -22, color: '#eedfbd' },
  { top: 28, color: '#a3643f' },
  { top: 72, color: '#dcc49c' },
  { top: 104, color: '#8f6048' },
  { top: 128, color: '#bfa07c' },
  { top: 158, color: '#6a574f' },
];

const moduleRows = [-142, -98, -52, -8, 34, 82, 126];
const redSpot = { x: 420, y: 52, name: 'utils' };

/** A gas giant: the monolith's modules are its storms, their dependencies its gas streams. */
export function paintJovianSurface({ seed, spinSeconds }) {
  const random = seededRandom(Number(seed));
  const waves = bands.map(() => bandWave(random));
  const tile = [drawBands(waves), drawStreaks(waves, random), drawCode(random)].join('');
  return spinningSurface({ tile, period, overhang, spinSeconds });
}

/** Whole wave numbers make each band edge meet itself where the tile repeats. */
function bandWave(random) {
  const harmonics = [2, 3, 5, 8].map((waveNumber) => ({
    waveNumber,
    amplitude: random.between(1, 4.5),
    phase: random.between(0, 2 * Math.PI),
  }));
  return (x) =>
    harmonics.reduce(
      (offset, { waveNumber, amplitude, phase }) =>
        offset + amplitude * Math.sin((2 * Math.PI * waveNumber * x) / period + phase),
      0,
    );
}

function edgePoints(y, wave) {
  const points = [];
  for (let x = -edgeStep; x <= period + edgeStep; x += edgeStep)
    points.push(`${x} ${rounded(y + wave(x))}`);
  return points.join('L');
}

function drawBands(waves) {
  const [polar, ...rest] = bands;
  const backdrop = `<rect x="${-edgeStep}" y="${-discRadius}" width="${period + 2 * edgeStep}" height="${2 * discRadius}" fill="${polar.color}"/>`;
  const stripes = rest.map(
    ({ top, color }, index) =>
      `<path d="M${-edgeStep} ${discRadius}L${edgePoints(top, waves[index + 1])}L${period + edgeStep} ${discRadius}Z" fill="${color}"/>`,
  );
  return backdrop + stripes.join('');
}

function drawStreaks(waves, random) {
  return bands
    .flatMap(({ top }, index) => {
      const depth = (bands[index + 1]?.top ?? discRadius) - top;
      return [0.3, 0.55, 0.8].map((share) => drawStreak(top + depth * share, waves[index], random));
    })
    .join('');
}

function drawStreak(y, wave, random) {
  const dashes = [40, 14, 90, 22, 26, 10].map((length) =>
    rounded(length * random.between(0.5, 1.8)),
  );
  const tone = random.pick(['#fff5dc', '#3b2218']);
  return `<path d="M${edgePoints(y, wave)}" fill="none" stroke="${tone}" stroke-width="${rounded(random.between(1.2, 3.4))}" stroke-dasharray="${dashes.join(' ')}" opacity="${rounded(random.between(0.12, 0.3))}"/>`;
}

function drawRedSpot() {
  const { x, y } = redSpot;
  return `<g transform="translate(${x} ${y})">
<ellipse rx="58" ry="35" fill="none" stroke="#f1dfbb" stroke-width="5" opacity=".55"/>
<ellipse rx="50" ry="29" fill="#c2603f"/>
<ellipse rx="38" ry="21" fill="#a63d27"/>
<ellipse rx="24" ry="12" fill="#7f2a1e"/>
<path d="M-44 -6Q-10 -24 30 -14M-36 10Q0 24 42 6" fill="none" stroke="#e6a37d" stroke-width="2" opacity=".6"/>
${drawStormName(redSpot.name, -42)}
</g>`;
}

/** Covers the spot and the name floating above it. */
function overlapsRedSpot({ x, y }) {
  const below = y - redSpot.y;
  return Math.abs(x - redSpot.x) < 85 && below > -75 && below < 52;
}

/** The Great Red Spot is the hub that every nearby storm feeds. */
function drawCode(random) {
  const graph = createModuleGraph({
    random,
    period,
    rows: moduleRows,
    columns: 8,
    reach: 300,
    linksPerModule: 2,
    isReserved: overlapsRedSpot,
  });
  const hubLinks = linksIntoHub(redSpot, graph.modules, { period, reach: 190, random });
  return [
    drawGasStreams([...graph.links, ...hubLinks], random),
    drawRedSpot(),
    drawStormSpots(graph.modules, random),
  ].join('');
}
