// S — One reason to change per module.
// O — Add implementations at explicit extension points.
// L — Every implementation keeps the same promises.
// I — Consumers depend on small, focused contracts.
// D — Policy depends on contracts; inject the adapters.

// Extension recipe:
// 1. Name the behavior that varies.
// 2. Define its contract, including failure semantics.
// 3. Add a Strategy / Adapter implementation.
// 4. Wire it at the composition root.
// 5. Run the same contract tests against each variant.

// Keep the orchestration unaware of concrete variants.
// Add patterns for real variation, not hypothetical needs.
