export const slides = [
  {
    file: '01-introduction.ts', short: 'The architecture is the context', label: 'A TALK ABOUT CODE, CONTEXT & COLLABORATION',
    title: 'Designing Architectures<br>that <em>AI can work with</em>',
    description: 'Make the right change easy to discover,<br>easy to describe, and easy to verify.',
    code: `/**
 * Designing Architectures
 * that AI can work with
 *
 * Mantas Indrašius
 * Dev Lead @ Wix.com
 */

const architecture = {
  boundaries: "explicit",
  context: "local",
  feedback: "executable",
};

// Good architecture is a shared language.
// For humans. And their AI collaborators.

export default architecture;`,
    takeaway: 'Better context starts with better boundaries.',
    notes: 'Open with a familiar problem: a small feature that requires understanding half the repository. AI makes the cost of implicit architecture visible. This talk explores three properties: explicit boundaries, local context, and executable feedback.'
  },
  {
    file: '02-boundaries.ts', short: 'Make the contract explicit', label: '01 / EXPLICIT BOUNDARIES',
    title: 'A small contract.<br><em>A clear place to work.</em>',
    description: 'Give each change a home. Keep business rules<br>separate from storage and delivery.',
    code: `type Order = {
  id: string;
  total: number;
};

// The domain defines what it needs.
interface OrderStore {
  save(order: Order): Promise<void>;
}

// Dependencies are visible at the boundary.
export async function placeOrder(
  order: Order,
  store: OrderStore,
): Promise<void> {
  if (order.total <= 0) {
    throw new Error("Total must be positive");
  }
  await store.save(order);
}`,
    takeaway: 'Let the agent reason about one module at a time.',
    notes: 'The use case depends on a small interface, not a database client. Ask the agent to add a business rule here: the input, dependency, and failure behavior are all visible. A database adapter can evolve independently. Small boundaries still need integration tests.'
  },
  {
    file: '03-feedback.ts', short: 'Turn intent into feedback', label: '02 / EXECUTABLE FEEDBACK',
    title: 'Describe the rule.<br><em>Prove the behavior.</em>',
    description: 'Tests turn architectural intent into a feedback<br>loop an agent can use to correct its work.',
    code: `// A pure rule. No network. No hidden state.
export function canPlaceOrder(total: number) {
  return Number.isFinite(total) && total > 0;
}

// Examples define the behavior at the boundary.
const cases = [
  { total: 42, expected: true },
  { total: 0, expected: false },
  { total: -5, expected: false },
  { total: NaN, expected: false },
];

for (const { total, expected } of cases) {
  const actual = canPlaceOrder(total);
  if (actual !== expected) {
    throw new Error(\`Unexpected result: \${total}\`);
  }
}
// Try changing > 0 to >= 0, then run the checks.`,
    takeaway: 'A useful feedback loop ends in evidence.',
    notes: 'Run the example, then change > 0 to >= 0 and run again. The zero case fails, making the regression concrete. These examples are a starting point, not complete coverage. Pair fast local checks with type checking, integration tests, and human review.'
  }
];
