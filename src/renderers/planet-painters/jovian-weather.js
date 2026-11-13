import { linkPath } from './module-graph.js';
import { rounded } from './seeded-random.js';

/** Storm colourings: white ovals, red spots, brown barges and tan ovals. */
const stormTones = [
  { body: '#f7ecd4', core: '#fffaf0', swirl: '#c39a70' },
  { body: '#c96a45', core: '#9b3a26', swirl: '#f3bb97' },
  { body: '#6a3a2a', core: '#48241b', swirl: '#c08c6a' },
  { body: '#e8b98a', core: '#f8dfbd', swirl: '#a5643c' },
];

const gasTones = ['#fff6e0', '#fff6e0', '#f0b088', '#5f2c1f'];

/** Every module is a named storm in the cloud deck. */
export function drawStormSpots(modules, random) {
  return modules.map((module) => drawStormSpot(module, random)).join('');
}

function drawStormSpot({ x, y, name }, random) {
  const width = random.between(13, 20);
  const height = width * random.between(0.55, 0.68);
  const { body, core, swirl } = random.pick(stormTones);
  const swirls = `M${rounded(-width * 0.7)} ${rounded(-height * 0.15)}Q0 ${rounded(-height * 0.8)} ${rounded(width * 0.6)} ${rounded(-height * 0.1)}M${rounded(-width * 0.5)} ${rounded(height * 0.3)}Q0 ${rounded(height * 0.75)} ${rounded(width * 0.7)} ${rounded(height * 0.15)}`;
  return `<g transform="translate(${rounded(x)} ${rounded(y)})">
<ellipse rx="${rounded(width + 6)}" ry="${rounded(height + 4.5)}" fill="#2a160f" opacity=".3"/>
<ellipse rx="${rounded(width + 3.5)}" ry="${rounded(height + 2.5)}" fill="none" stroke="#fff3d6" stroke-width="2.4" opacity=".7"/>
<ellipse rx="${rounded(width)}" ry="${rounded(height)}" fill="${body}"/>
<ellipse rx="${rounded(width * 0.55)}" ry="${rounded(height * 0.5)}" fill="${core}"/>
<path d="${swirls}" fill="none" stroke="${swirl}" stroke-width="1.3" opacity=".8"/>
${drawStormName(name, -height - 9)}
</g>`;
}

function drawStormName(name, y) {
  return `<text class="pe-code-name" y="${rounded(y)}" text-anchor="middle">${name}</text>`;
}

/** Every dependency is a stream of gas: a faint ribbon with wisps flowing to the dependency. */
export function drawGasStreams(links, random) {
  return links.map((link) => drawGasStream(link, random)).join('');
}

function drawGasStream(link, random) {
  const lane = linkPath(link);
  const tone = random.pick(gasTones);
  const wispDelay = rounded(random.between(-3, 0));
  return `<path class="pe-gas-stream" d="${lane}" stroke="${tone}"/>
<path class="pe-gas-wisp" d="${lane}" stroke="${tone}" style="animation-delay:${wispDelay}s"/>`;
}
