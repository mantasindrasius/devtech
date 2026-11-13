---
name: deep-modules
description: Design modules with small public interfaces that hide substantial implementation complexity. Use when defining package APIs, reducing caller knowledge, or composing domain capabilities into applications.
---

# Deep modules

A deep module hides complexity behind a simple interface, following the principle described by John Ousterhout in A Philosophy of Software Design. Depth is not a line count: judge how much callers need to know to use the capability correctly.

## Evaluate the boundary

- Count more than exported methods: types, configuration, call ordering, invariants, error handling, performance assumptions, and lifecycle rules all contribute to interface complexity.
- Ask what happens if the module disappears. Would its implementation knowledge spread into callers? This is a diagnostic, not a reason to delete purposeful adapters.
- Watch for callers orchestrating validation, calculation, persistence, and event dispatch that belong to one domain capability.
- Prefer operations expressing intent over getters and setters that expose representation or require callers to enforce invariants.
- For an important shared boundary, sketch alternative APIs and compare caller knowledge, failure semantics, and likely changes before choosing one.

## Organize implementation

- Keep implementation details and internal submodules private. Consumers use the public entry point, not internal file paths.
- Keep dependencies explicit and directional. Consult [SOLID design](../solid-design/SKILL.md) and [extensible design](../extensible-design/SKILL.md) for contracts and extension points.
- Place orchestration of a domain capability inside its module. Keep protocol translation at the adapter boundary and business authorization rules in the domain.
- Use ports for genuine variable dependencies, especially external I/O. Do not introduce an interface for every local function by default.
- Define events and subscriptions intentionally: payloads, ordering guarantees, ownership, and unsubscription must be clear.

## Compose applications

A composition root creates adapters, wires deep modules, and owns startup and shutdown. It should not accumulate business policy. One module may serve several endpoints; one application may compose several modules.

Module boundaries and deployment boundaries are separate decisions. Moving a capability across a process boundary introduces latency, retries, timeouts, idempotency, and consistency concerns. Explicitly revise the contract where those change semantics.

## Verify behavior

- Test public capabilities and observable outcomes using [fluent tests](../fluent-tests/SKILL.md).
- Use real predictable local collaborators where practical; control remote dependencies through explicit adapters.
- Verify real integration contracts separately. In-memory implementations must respect the relevant production semantics.
- Keep focused algorithm tests when useful. Avoid tests coupled to incidental internal call sequences that make safe refactoring expensive.
- Judge success by localized changes, understandable contracts, and fewer caller assumptions—not by hiding a large file behind a tiny export.
