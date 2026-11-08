import { prepareSpacecraftBuild } from './spacecraft-build.js';

const svgNamespace = 'http://www.w3.org/2000/svg';

const backgroundBuilds = [
  {
    name: 'AI / 02',
    position: 'translate(290 550) rotate(-5) scale(0.56) translate(-720 -690)',
    delay: '0.7s',
    depth: 'near',
  },
  {
    name: 'AI / 03',
    position: 'translate(1140 385) rotate(7) scale(0.38) translate(-720 -690)',
    delay: '1.4s',
    depth: 'far',
  },
];

function simplifyBackgroundDetail(group, name) {
  for (const label of group.querySelectorAll('.hull-number')) label.textContent = name;
  for (const label of group.querySelectorAll('.tower-label')) label.remove();
  for (const stream of group.querySelectorAll('.ship-leak-flow')) {
    const particles = stream.querySelectorAll('.pressure-fog-particle');
    particles.forEach((particle, index) => {
      if (index % 2 === 1) particle.remove();
    });
  }
}

export function addParallelSpacecraft(art) {
  const svg = art.querySelector('svg');
  const layers = [...svg.children].filter((layer) =>
    layer.matches('.spacecraft-motion, [data-appears-at="2"], [data-appears-at="3"]'),
  );

  for (const [index, build] of backgroundBuilds.entries()) {
    const group = document.createElementNS(svgNamespace, 'g');
    group.setAttribute('class', `background-build background-build-${build.depth}`);
    group.setAttribute('transform', build.position);
    group.style.setProperty('--build-offset', build.delay);
    group.setAttribute('aria-hidden', 'true');
    for (const layer of layers) group.append(layer.cloneNode(true));
    simplifyBackgroundDetail(group, build.name);
    prepareSpacecraftBuild(group, index + 2);
    svg.insertBefore(group, layers[0]);
  }
  const foreground = document.createElementNS(svgNamespace, 'g');
  svg.insertBefore(foreground, layers[0]);
  for (const layer of layers) foreground.append(layer);
  prepareSpacecraftBuild(foreground, 1);
  for (const status of [...svg.children].filter((layer) => layer.hasAttribute('data-appears-at'))) {
    if (!status.classList.contains('spacecraft-build')) status.remove();
  }
}
