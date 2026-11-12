/** Deterministic randomness keeps generated planet art identical on every render. */
export function seededRandom(seed) {
  if (!Number.isInteger(seed)) throw new Error(`Planet painter seed must be an integer: ${seed}`);
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
  return {
    between: (min, max) => min + next() * (max - min),
    pick: (items) => items[Math.floor(next() * items.length)],
  };
}

/** One decimal is below a rendered pixel and keeps the generated markup compact. */
export const rounded = (value) => Math.round(value * 10) / 10;

export const point = ({ x, y }) => `${rounded(x)} ${rounded(y)}`;
