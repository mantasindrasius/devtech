const reproducible = [
  'Pinned runtime and dependency lockfile',
  'Declared inputs and clean environments',
  'No undeclared machine-local state',
];

const fast = ['Correctly keyed caches', 'Incremental compilation', 'Affected-package checks'];

// Cache keys include relevant configuration.
// Keep broader integration checks as a guard.
