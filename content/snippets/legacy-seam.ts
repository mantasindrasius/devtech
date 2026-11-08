// Capture observable behavior before changing policy.
const legacy = createLegacyPricing(realisticFixtures);
expect(legacy.quote(existingOrder)).toEqual(savedQuote);

// Introduce a seam around an external dependency.
const pricing = createPricing({ catalog: inMemoryCatalog });

// Change one rule under focused tests.
// Keep contract checks against the real adapter.
// Replace the old path incrementally.
