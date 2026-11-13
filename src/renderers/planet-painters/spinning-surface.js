/** Every planet disc is drawn at this radius and scaled into place by the illustration. */
export const discRadius = 200;

/**
 * Repeats one tile of surface art so that scrolling it by `period` loops without a seam.
 * Art anchored inside a tile may reach up to `overhang` units into its neighbours.
 */
export function spinningSurface({ tile, period, overhang, spinSeconds }) {
  const seconds = Number(spinSeconds);
  if (!(seconds > 0)) throw new Error(`Planet surface needs a positive spin time: ${spinSeconds}`);
  if (period < 2 * (discRadius + overhang))
    throw new Error(`Surface period ${period} is too short for an overhang of ${overhang}`);

  const start = -discRadius - overhang;
  return `<g class="pe-spin" style="--spin-period:${period}px;--spin-seconds:${seconds}s">
<g transform="translate(${start} 0)">${tile}</g>
<g transform="translate(${start + period} 0)">${tile}</g>
</g>`;
}
