// A review shortlist, not a quality score.
const investigate = [
  'complex branches with weak coverage',
  'deeply nested control flow',
  'frequently changed, fragile modules',
  'packages that always change together',
  'forbidden dependencies and cycles',
];

// CRAP: complexity + test coverage.
// Also inspect cognitive complexity,
// change hotspots, and change coupling.
