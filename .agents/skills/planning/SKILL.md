---
name: planning
description: Plan a feature, architectural change, or migration from evidence in the repository. Use for changes spanning multiple responsibilities, uncertain requirements, or incremental migrations.
---

# Planning

Make the proposed change concrete enough to implement and verify. Scale the plan to the task: a small edit needs a short plan, not a new documentation hierarchy.

## Discover before designing

1. Read applicable repository instructions and the relevant design skills.
2. Identify affected entry points, callers, contracts, tests, and documentation.
3. Describe current behavior from the code. Separate evidence from assumptions.
4. Identify the desired outcome, constraints, and observable acceptance criteria.
5. Ask only for missing decisions that materially affect the result; continue independent work when possible.

## Design the change

- Keep product intent separate from implementation choices.
- Explain the current-to-target delta and which module owns each responsibility.
- Compare alternatives when the boundary is consequential. Prefer a small public interface hiding implementation complexity; consult [deep modules](../deep-modules/SKILL.md).
- Classify each step as behavior preserving or behavior changing. Define the verification that distinguishes success from an accidental change.
- Include lifecycle ownership, errors, compatibility, and affected callers where relevant.
- Include proportionate cleanup and documentation updates. Do not turn architectural aspirations into an unauthorized rewrite.

## Record and execute

For substantial work, use the repository's existing planning location and this outline:

```markdown
# Change plan
## Outcome and acceptance criteria
## Current state and evidence
## Target design and alternatives
## Constraints, assumptions, and open decisions
## Steps
- [ ] Small independently verifiable change — validation
## Documentation affected
## Risks and rollback
```

Update the plan when new evidence changes it. Mark completed work with actual validation results, and distinguish pending checks from passing checks.

For migrations, keep intermediate states usable: identify compatibility boundaries, move callers incrementally, and remove old paths only after verifying their consumers have moved. Use [PR lifecycle](../pr-lifecycle/SKILL.md) to reconcile plans with the final implementation.
