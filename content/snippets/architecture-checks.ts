// Illustrative dependency policy.
const boundaries = {
  domain: {
    mayImport: ['domain'],
    mustNotImport: ['http', 'database'],
  },
  application: {
    mayImport: ['domain'],
  },
};

// Enforce package exports and import rules.
// Reject dependency cycles in CI.
// Run shared contracts against adapters.
