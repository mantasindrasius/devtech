---
name: solid-design
description: Design or refactor module boundaries, contracts, and dependencies in Monaco Slides using SOLID principles. Use for feature implementation and architecture reviews involving state, adapters, or lifecycle ownership.
---

# SOLID design

Make each feature understandable through a small public contract. Apply SOLID to functions and modules; introducing classes or interfaces is not a goal by itself.

## Design decisions

- **Single responsibility:** give a module one reason to change. Keep slide content, transition sequencing, camera movement, editor effects, rendering, and persistence separately owned when they evolve independently. Entrypoints compose these pieces rather than implementing all of them.
- **Open/closed:** deliberately expose extension points for slide types, renderers, transitions, and editor effects. Prefer new implementations plus registration or composition over feature-specific branches. Follow the [extensible-design skill](../extensible-design/SKILL.md) for pattern selection and contracts; keep the mechanism proportionate to the extension axis.
- **Liskov substitution:** implementations preserve their boundary's observable contract: inputs, outputs, errors, async completion, and cancellation. A fake editor or scheduler must honor the same guarantees. Do not silently ignore unsupported operations.
- **Interface segregation:** depend only on capabilities a consumer needs. A camera effect should not receive the entire presentation controller. Prefer small capability objects over giant services or unnecessary one-method wrappers.
- **Dependency inversion:** sequencing and policy depend on explicit capabilities, not DOM queries, storage globals, or Monaco internals. Inject boundary functions or adapters at composition time. Keep pure calculations independent of rendering libraries.

## State and effects

Identify the owner of each model, listener, timer, worker, and animation. Give owned resources a clear cleanup path. Prefer a returned completion promise or cancellation handle to fire-and-forget work.

Do not let stale async completions mutate a newer slide. Specify behavior for replay, navigation during animation, disposal, and repeated cleanup. Preserve saved code separately from temporary demo models.

For CLI code, separate registry policy from Git/process/filesystem adapters. Test policy directly and verify adapters with small integration tests.

## Working method

1. Read callers and tests; identify behavior that must stay stable.
2. Identify the changing responsibility, its inputs/outputs, and effects.
3. Choose the smallest boundary that makes dependencies explicit. Keep cohesive helpers private.
4. Change incrementally; preserve contracts or update consumers together.
5. Verify observable behavior, including relevant failures and cleanup, using the fluent-tests skill.

An abstraction should localize a real change, expose a dependency, or protect a contract. Otherwise keep the simpler code. Explain significant tradeoffs using the concrete modules involved.
