// CRAP = C² × (1 - coverage)³ + C
// coverage is a fraction from 0 to 1.
// Worked assumptions, NOT an analyzer report.

const complexity = 6;
const withoutTests = 6 ** 2 * (1 - 0) ** 3 + 6;
// 42

const halfwayCovered = 6 ** 2 * (1 - 0.5) ** 3 + 6;
// 10.5

const fullyCovered = 6 ** 2 * (1 - 1) ** 3 + 6;
// 6 — same complexity, different coverage.

// Coverage cannot prove assertion quality.
// Method extraction can hide rather than fix risk.
// Also inspect coupling, nesting, and change hotspots.
