---
name: pr-lifecycle
description: Carry a change through discovery, implementation, verification, cleanup, and documentation reconciliation. Use when preparing or wrapping a PR, reviewing readiness, or closing a multi-step change.
---

# PR lifecycle

Keep a change reviewable, verified, and consistent with its documentation. This workflow does not grant permission to publish, merge, deploy, or send messages; follow the user's authorization and repository instructions.

## Discover and scope

- Establish the problem, intended behavior, touched boundaries, and acceptance criteria.
- Inspect existing changes and preserve work outside the task.
- For substantial work, use [planning](../planning/SKILL.md) to record current state, target state, decisions, and verification.
- Prefer one coherent change per PR. Split independent work or use a PR stack when dependencies warrant it; document each layer's base and validation.

## Implement and verify

- Distinguish behavior changes from refactoring. Use regression checks for the former and relevant baseline checks for the latter.
- Run repository-supported checks appropriate to the changed behavior. Record failures and whether they existed before the change.
- Review the actual diff for correctness, public contract changes, test quality, resource ownership, and accidental scope expansion.
- Use [refactor](../refactor/SKILL.md) for focused cleanup. Improve the touched code without disguising a broader rewrite as housekeeping.
- When a reviewer or CI reports a defect, resolve it and rerun affected checks on the updated revision.

## Close the documentation loop

1. Compare the final implementation with the plan and acceptance criteria.
2. Update affected architecture, feature, package, and usage documentation to describe what actually exists.
3. Preserve useful decisions, tradeoffs, and verification evidence in durable documentation or the change description.
4. Mark plans complete or archive them according to repository conventions. Remove stale temporary notes only after retaining useful information; do not delete user-authored plans blindly.
5. Record genuinely deferred work explicitly. Do not describe unfinished behavior as delivered.
6. Improve a relevant skill when the change reveals a reusable lesson, keeping the rule scoped and evidence-based.

## Ready for review

Summarize the problem, resulting behavior, relevant design decisions, tests actually run, and remaining limitations. Include visual evidence for visual changes when available.

Readiness requires the relevant checks and resolved blocking findings. A build is not browser verification, and local tests are not CI results. Recheck changed areas after follow-up edits; do not repeat unrelated checks without cause. Keep repository hooks enabled.
