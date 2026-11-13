---
name: refactor
description: Improve touched code while preserving its observable behavior and contracts. Use for focused cleanup, responsibility extraction, complexity reduction, or reviewing refactoring safety.
---

# Refactor

Make scoped structural improvements, then verify that behavior remains intact. Follow [Clean Code](../clean-code/SKILL.md), [SOLID design](../solid-design/SKILL.md), and [extensible design](../extensible-design/SKILL.md).

## Establish the baseline

1. Read the implementation, its callers, and relevant tests rather than inferring behavior from names.
2. Identify public exports, observable side effects, errors, timing, and resource ownership that must remain stable.
3. Inspect the working tree and preserve unrelated edits.
4. Run focused existing checks when they provide a meaningful baseline. Record pre-existing failures accurately.

## Improve in small steps

- Prioritize correctness and reliability findings, then maintainability, then style. Treat a behavior-changing bug fix as a distinct change with explicit verification.
- Name the responsibility being extracted before moving code. Split by reasons to change rather than line-count targets.
- Simplify control flow, clarify names, remove stale code, and consolidate duplication that represents the same rule.
- Preserve public contracts and update all affected callers when a deliberate contract change is in scope.
- Keep pure transformations separate from I/O; preserve cancellation, disposal, and failure semantics.
- Avoid test-only production branches, speculative abstractions, blanket error swallowing, or fallback behavior introduced just to make tests pass.
- Use supported mechanical tools where helpful; inspect their actual diff.
- Do not rewrite unrelated oversized modules. Record broader work as a concrete follow-up when needed.

## Verify and report

Use the repository's actual scripts and [fluent tests](../fluent-tests/SKILL.md). Run checks affected by the refactor and build when imports or bundling change. Add tests for important uncovered behavior when necessary, not merely to mirror the new implementation.

Complexity, coverage, and size measurements can reveal friction. Interpret them together with responsibility and readability; do not compress code or weaken tests to improve a score.

Inspect the final diff for accidental behavior changes. Update documentation when responsibilities or public contracts move. Report what improved, what remains, and the checks actually run. Use [PR lifecycle](../pr-lifecycle/SKILL.md) for final documentation and review readiness.
