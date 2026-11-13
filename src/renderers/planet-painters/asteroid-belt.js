import { rounded, seededRandom } from './seeded-random.js';

const driftPxPerSecond = 11;

/** Streams of rock sharing one lane; `rockLength` near zero draws round pebbles. */
const streams = [
  { rocks: 9, periodPx: 150, widthPx: 2, rockLength: 0.1, cap: 'round', tone: '#cfc8b6' },
  {
    rocks: 5,
    periodPx: 210,
    widthPx: 3.6,
    rockLength: 0.1,
    cap: 'round',
    tone: '#9d968a',
    inbound: true,
  },
  { rocks: 4, periodPx: 240, widthPx: 3, rockLength: 3.5, cap: 'butt', tone: '#b9ad98' },
  {
    rocks: 2,
    periodPx: 330,
    widthPx: 6.5,
    rockLength: 1.5,
    cap: 'round',
    tone: '#857e73',
    inbound: true,
  },
];

/** Rocks drifting both ways along `lane`: the connection two service planets maintain. */
export function paintAsteroidBelt({ lane, seed }) {
  if (!lane?.startsWith('M')) throw new Error(`Asteroid belt needs an SVG path lane: ${lane}`);
  const random = seededRandom(Number(seed));
  const dust = `<path class="pe-belt-dust" d="${lane}"/>`;
  return dust + streams.map((stream) => drawStream(lane, stream, random)).join('');
}

function drawStream(lane, stream, random) {
  const shift = `translate(${rounded(random.between(-7, 7))} ${rounded(random.between(-7, 7))})`;
  const direction = stream.inbound ? ' pe-rocks--inbound' : '';
  const style = `--belt-period:${stream.periodPx}px;--belt-seconds:${rounded(stream.periodPx / driftPxPerSecond)}s`;
  return `<path class="pe-rocks${direction}" d="${lane}" transform="${shift}" stroke="${stream.tone}" stroke-width="${stream.widthPx}" stroke-linecap="${stream.cap}" stroke-dasharray="${rockPattern(stream, random)}" style="${style}"/>`;
}

/** Uneven gaps that add up to exactly one period, so the drifting pattern loops seamlessly. */
function rockPattern({ rocks, periodPx, rockLength }, random) {
  const weights = Array.from({ length: rocks }, () => random.between(0.3, 1.7));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const emptySpace = periodPx - rocks * rockLength;
  const gaps = weights.map((weight) => Math.round((emptySpace * weight * 100) / totalWeight) / 100);
  const lastGap = emptySpace - gaps.slice(0, -1).reduce((sum, gap) => sum + gap, 0);
  gaps[gaps.length - 1] = Math.round(lastGap * 100) / 100;
  return gaps.map((gap) => `${rockLength} ${gap}`).join(' ');
}
