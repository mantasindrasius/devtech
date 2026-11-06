// BETTER: policy priority is visible.
// Still C = 6. Readability is not branch count.
export function shipping(us: boolean, express: boolean, member: boolean, subtotalCents: number) {
  if (!us) return express ? 3000 : 1500;
  if (express) return 1500;
  if (member) return 0;
  if (subtotalCents >= 5000) return 0;
  return 500;
}

// Contract: cents; validated non-negative subtotal.
// Express takes priority over membership.
// Membership waives standard US shipping only.
