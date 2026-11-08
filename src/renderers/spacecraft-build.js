const svgNamespace = 'http://www.w3.org/2000/svg';
const stageSeconds = [0, 0, 4, 8, 18, 24, 30, 36, 44, 48, 52, 56];

function addHardwareFasteners(group) {
  for (const part of group.querySelectorAll('.installed-part')) {
    const bolts = document.createElementNS(svgNamespace, 'g');
    bolts.setAttribute('class', 'hardware-impact-bolts');
    bolts.innerHTML = `<circle cx="-3" cy="-3" r="1.5"/><circle cx="3" cy="3" r="1.5"/>`;
    part.append(bolts);
  }
}

function addLeakRepair(layer) {
  const surface = layer.firstElementChild;
  const patch = document.createElementNS(svgNamespace, 'g');
  patch.setAttribute('class', 'ship-leak-repair');
  patch.innerHTML = `
    <rect x="-6" y="-13" width="12" height="26" rx="4" fill="url(#ship-metal)" stroke="#bed3dd"/>
    <path d="M-3-8h6M-3 8h6" stroke="#eff5f7" stroke-width="2"/>`;
  surface.append(patch);
}

export function prepareSpacecraftBuild(group, appearsAt) {
  addSpacecraftMaintenance(group, appearsAt);
  addHardwareFasteners(group);
  group.classList.add('spacecraft-build');
  group.dataset.appearsAt = appearsAt;
  for (const layer of group.querySelectorAll('[data-appears-at]')) {
    const starts = stageSeconds[Number(layer.dataset.appearsAt)];
    const ends = stageSeconds[Number(layer.dataset.disappearsAt)];
    layer.style.setProperty('--layer-start', `${starts}s`);
    layer.classList.add('build-layer', 'is-visible');
    if (ends !== undefined) {
      layer.style.setProperty('--layer-end', `${ends}s`);
      layer.classList.add('build-layer-temporary');
    }
    delete layer.dataset.appearsAt;
    delete layer.dataset.disappearsAt;
    if (layer.classList.contains('ship-hull-leak')) addLeakRepair(layer);
  }
}
import { addSpacecraftMaintenance } from './spacecraft-maintenance.js';
