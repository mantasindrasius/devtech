---
name: extensible-design
description: Design code that grows through explicit extension points, composable behaviors, and design patterns. Use when adding slide types, transitions, editor effects, renderers, or other variants, and when reviewing whether new behavior requires changing core orchestration.
---

# Extensible design

Extensibility is a first-class design goal in this repository. Prefer adding a small implementation and registering or composing it over changing existing orchestration for every new feature. Encourage design patterns when they give that extension path a clear contract.

Use alongside the SOLID design skill for responsibility and dependency rules, Clean Code for implementation size, and fluent-tests for verification. This skill defines how behavior is extended, not a mandate to refactor unrelated code.

## Make extension points explicit

Before implementing a variant, identify:

1. **Stable policy:** sequencing, cancellation, model ownership, and other invariants that all variants share.
2. **Variable behavior:** the particular renderer, effect, transition, layout, or command being added.
3. **Contract:** the inputs, capabilities, outputs, completion signal, failure behavior, and cleanup expected from that behavior.
4. **Composition point:** where implementations are explicitly registered and wired together.

Design the boundary before another variant requires branching through the core. Slide content, renderers, transition steps, and editor effects are established extension axes here; they justify deliberate extension points even when the first implementation is small.

Keep consumer code dependent on the contract. Implementations must not inspect slide indexes, mutate unrelated controller state, or depend on sibling implementations. Put variant-specific defaults and validation with the implementation.

## Choose a pattern for the variation

| Variation | Preferred pattern | Application in this repository |
| --- | --- | --- |
| Interchangeable algorithm or presentation behavior | Strategy | A renderer, layout rule, or camera movement supplied through a small contract |
| An action with a lifecycle | Command | Reveal text, open an editor menu, or simulate typing as independently executable steps |
| Groups of behaviors | Composite | Sequence or parallel composition of steps, using the same execution contract as a single step |
| Selection and construction by a stable identifier | Registry + Factory | Register a step or renderer by kind and create it from validated slide data |
| External library or environment integration | Adapter | Wrap Monaco, Mermaid, browser animation, storage, or a scheduler behind the capabilities used by the feature |
| Optional behavior around an existing implementation | Decorator | Add focus highlighting, timing, or instrumentation while preserving the wrapped contract |
| Transitions with legal and illegal actions | State / explicit state machine | Model idle, playing, cancelling, and disposed states rather than accumulating boolean flags |
| Independent consumers of a completed event | Observer | Notify progress indicators or notes after a step completes, with explicit subscription cleanup |

Patterns may be functions, plain objects, or classes. Choose the form that makes the contract obvious. Prefer composition to inheritance. Use a base class only when it protects a real shared lifecycle invariant; avoid subclasses that override unrelated internals.

Do not combine every pattern in every feature. An injected function may be a complete Strategy. A local map and a factory may be a complete registry. Keep extension machinery smaller than the problem it organizes.

## Contracts that can be extended safely

- Use stable, meaningful IDs and named options instead of positional slide numbers or anonymous boolean mode flags.
- Expose only required capabilities. An effect that edits a temporary model does not need access to persistent storage or the entire application.
- Prefer declarative slide data that references registered behaviors. Keep implementation code outside the slide schema; validate unknown kinds and invalid options at the boundary.
- Make registration explicit at a composition root. Reject duplicate IDs and unknown kinds with useful errors. Avoid hidden import-time registration, global service locators, and silent fallback implementations.
- Define async completion: a step's promise resolves when its promised effect is complete, not merely scheduled. Define whether cancellation rejects or returns a distinct outcome, and keep implementations consistent.
- Make cleanup idempotent and ownership explicit. Cancellation, replay, navigation, and disposal must stop or invalidate pending work and release models, listeners, animations, and workers.
- A cancelled or disposed extension must not update a newer slide. Keep temporary demo edits isolated from saved user code.
- Define composition semantics: sequence order, parallel conflicts, error propagation, cancellation propagation, and cleanup order. Parallel effects must not compete for the same mutable resource without an explicit policy.
- Optional capabilities such as reverse playback must be explicit. Do not require fake no-op implementations of operations that a step cannot support.
- Preserve reduced-motion behavior through the same contract, such as completing a visual change immediately while still reporting completion and honoring cancellation.

For published or persisted configuration, preserve compatibility deliberately. Introduce defaults or a migration for changed options. Do not add version-negotiation infrastructure to internal contracts that have no compatibility requirement.

## Extension workflow

1. Read the nearest implementations and their consumers. Reuse their contract if it already fits.
2. State what the new behavior varies and which invariants stay in core policy.
3. Add or refine the narrow extension contract; choose the pattern that expresses it.
4. Implement the variant in a cohesive module, inject dependencies, and register it explicitly.
5. Wire the behavior through data or composition. Keep feature-specific conditionals out of the shared execution loop.
6. Verify the extension and shared lifecycle. Document the registration point and options where another contributor would look.

A contract may evolve when a new requirement exposes a genuine missing concept. Update affected consumers and implementations together instead of adding escape hatches to reach private state. Do not freeze a poor abstraction just to avoid modifying a file.

## Prove openness with tests

When changing an extension mechanism, add a small test implementation that is not a built-in variant. Register it through the public contract and verify that orchestration executes it without a special branch. Keep this probe inside tests rather than shipping a speculative product feature.

Run shared contract tests against relevant implementations: completion, cancellation, failure, repeated cleanup, and isolation of owned state. Add specific behavior tests for the new variant. Use deterministic schedulers and fluent drivers; verify outcomes rather than implementation class names.

Review the result with these questions:

- Can a contributor add the next renderer or step in its own module plus a registration/data entry?
- Does core orchestration remain unaware of the concrete kind?
- Can the extension be tested independently using its public capabilities?
- Are errors, cancellation, and resource ownership consistent across implementations?
- Is each abstraction protecting a named extension axis rather than hiding arbitrary complexity?

If the touched path needs a larger architectural migration, describe that boundary and its cost. Improve the current extension path within scope rather than silently rewriting the whole repository.
