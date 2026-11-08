const svgNamespace = 'http://www.w3.org/2000/svg';

export function chooseCreatureSlots(shipNumber, random = Math.random) {
  const slots = [0, 1, 2, 3];
  for (let index = slots.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [slots[index], slots[other]] = [slots[other], slots[index]];
  }
  return slots.slice(0, [3, 1, 2][shipNumber - 1]);
}

function engineerMarkup(facing) {
  return `<g class="maintenance-engineer"><g transform="scale(${facing} 1)" stroke="#263d4a" stroke-width="2">
    <rect x="-17" y="-28" width="12" height="23" rx="5" fill="#c99039"/>
    <path d="M-10-28Q-10-43 3-43Q17-43 17-28V-4H9V5H1V-4H-5V5H-12Z" fill="#edb65b"/>
    <rect x="1" y="-35" width="22" height="13" rx="6" fill="#8cd2e4"/>
    <path d="M5-32h12" stroke="#e7faff"/>
    <g class="engineer-wrench"><path d="M12-13l20-9" stroke="#e4b063" stroke-width="7"/>
    <path d="M31-22l6-8m-3 1 6 3" stroke="#d8e4e8" stroke-width="3"/></g>
  </g></g>`;
}

function addMaintenanceCrew(feature, slot) {
  const anchor = feature.firstElementChild;
  const left = slot % 2 === 0;
  const hullX = left ? 102 : -3;
  const anchorY = Number(anchor.getAttribute('transform').match(/translate\([^ ]+ ([^)]+)/)[1]);
  const floor = 687 - anchorY;
  const crewX = hullX + (left ? -48 : 38);
  const scene = document.createElementNS(svgNamespace, 'g');
  scene.setAttribute('class', 'feature-maintenance');
  scene.style.setProperty('--climb-y', `${120 - floor}px`);
  scene.style.setProperty('--climb-x', `${left ? 20 : -20}px`);
  const rungs = Array.from({ length: Math.ceil((floor - 120) / 16) }, (_, i) => {
    const y = 124 + i * 16;
    return `<path d="M${crewX - 9} ${y}h20"/>`;
  }).join('');
  scene.innerHTML = `
    <g class="maintenance-ladder" style="transform-origin:${crewX}px ${floor}px" stroke="#a4bac5" stroke-width="3" fill="none">
      <path d="M${crewX - 9} ${floor}V110M${crewX + 11} ${floor}V110"/>${rungs}
    </g>
    <ellipse class="removed-feature-hole" cx="${hullX}" cy="112" rx="6" ry="12" fill="#14232e" stroke="#d6e3e9"/>
    <g class="unbolted-leak" transform="translate(${hullX} 112)">
      <use href="#ship-fog-cloud" transform="translate(-12 0) scale(.45)"/>
      <use href="#ship-fog-cloud" transform="translate(-29 -8) scale(.7)"/>
    </g>
    <g class="engineer-installed-patch" transform="translate(${hullX} 112)">
      <rect x="-7" y="-18" width="14" height="36" rx="4" fill="url(#ship-shell)" stroke="#dce7ec"/>
      <path d="M-3-12h6m-6 24h6" stroke="#526d7d" stroke-width="3"/>
    </g>
    <g transform="translate(${crewX} ${floor})">${engineerMarkup(left ? 1 : -1)}</g>`;
  anchor.append(scene);
  const docking = anchor.querySelector('.feature-docking');
  const removal = document.createElementNS(svgNamespace, 'g');
  removal.setAttribute('class', 'feature-removal');
  removal.style.setProperty('--shot-x', left ? '-550px' : '550px');
  removal.style.setProperty('--shot-y', slot < 2 ? '-150px' : '90px');
  removal.style.setProperty('--carry-distance', `${floor - 115}px`);
  docking.before(removal);
  removal.append(docking);
  const clamp = document.createElementNS(svgNamespace, 'g');
  clamp.setAttribute('class', 'impact-clamp');
  clamp.innerHTML = `<path d="M43 106v9h38v-9" fill="none" stroke="#c1d3db" stroke-width="4"/>
    <circle cx="43" cy="111" r="3" fill="#e4edf1" stroke="#425868"/>
    <circle cx="81" cy="111" r="3" fill="#e4edf1" stroke="#425868"/>`;
  docking.querySelector('.feature-creature').append(clamp);
}

export function addSpacecraftMaintenance(group, shipNumber) {
  const selected = chooseCreatureSlots(shipNumber);
  group.querySelectorAll('.attached-feature').forEach((feature, slot) => {
    if (!selected.includes(slot)) return feature.remove();
    feature.style.setProperty('--maintenance-cycle', `${26 + shipNumber * 3 + slot * 2}s`);
    addMaintenanceCrew(feature, slot);
  });
}
