---
name: fluent-tests
description: Write and refactor behavior-focused Bun tests with Given-When-Then structure, fluent builders, and domain drivers. Use when adding tests, improving readability, or designing deterministic async test helpers in Monaco Slides.
---

# Fluent tests

Adapted from tddy-coder's fluent-tests skill, generic guidelines, TypeScript examples, and Bun workspace builders. This skill is self-contained; it does not require that checkout or its frameworks.

Tests explain setup, action, and outcome without making readers decode selectors, subprocess arguments, or protocol details. Read [Bun patterns](references/bun-patterns.md) when introducing a builder or driver.

## Structure

- Import `test`, `expect`, and lifecycle helpers from `bun:test`. Preserve the existing JS/TS choice; do not add a framework to get fluent syntax.
- Name tests for outcome and condition: “blocks a push when an outgoing commit contains a private registry reference.” Avoid `works`, `should`, method names alone, or workflow/PR labels.
- Use visually separated Given, When, Then sections. One behavior per test; several assertions can establish that one outcome.
- Keep a blank line between test cases, and between lifecycle hooks or helpers and the next test, so scenarios remain visually distinct.
- Keep scenarios flat, normally with at most one `describe` layer. Split success, rejection, deletion, and cleanup into separate tests.
- Do not branch on results or catch failures and accept an alternate outcome. Use `toThrow` or awaited rejection assertions. Cleanup in lifecycle hooks or `try/finally` is allowed.
- Use `test.each` for named tables of equivalent cases, rather than loops hiding multiple scenarios inside one test.

## Fluent vocabulary

- Small builders have valid defaults and domain names: `aSlide().withSteps(...)`, `aRepository().withCommittedFile(...)`. Override only scenario-relevant facts.
- Setup methods return the same logical builder, or a consistently immutable new builder. Do not recreate resources or lose state on each call.
- Drivers own selectors, DOM mounting, Monaco calls, subprocess commands, paths, and serialization. Tests use actions such as `advanceStep()` or `pushTo(remote)` and domain observations.
- Async actions return promises and are awaited. Ordinary promises do not support synchronous Cypress-style chaining. Build fluent data first, then await actions explicitly.
- Use built-in exact assertions for simple observations. Add a custom matcher only for a useful repeated domain claim, with expected/actual diagnostics. Bun's `expect` matchers are not automatically chainable.
- Helpers fail on invalid inputs and infrastructure errors instead of skipping work or manufacturing success.

## Determinism and evidence

Use expected values independent of production calculations. Compare exact outputs when the contract fixes them; partial assertions are appropriate only when additional data is irrelevant. Explain meaningful tolerances for generated IDs or rendering.

Test real policy logic. Use in-memory fakes for stateful boundaries and mocks for relevant external effects. Do not mock the function under test or assert only private method calls.

Await completion promises or domain events. For time-driven transitions, inject a scheduler or control timers; do not sleep for the animation duration. Use bounded polling only for external state without a completion signal. Restore mocks, dispose drivers, and remove temporary resources after failures too.

Relevant behaviors include step ordering, replay/cancellation, saved-model preservation, reduced motion, URL conversion, and outgoing Git history checks. Cover the requested behavior rather than inventing a speculative matrix.

Run `bun test <path>` or an existing focused script. Tests with a fake renderer do not prove browser layout or real Monaco integration; report that scope honestly.
