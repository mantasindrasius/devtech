# Designing Architectures that AI can work with

Content brainstorm and editorial decisions from our discussion. This is a working idea bank, not a script or a claim that every idea has been demonstrated empirically.

**Presenter:** Mantas Indrašius, Dev Lead at Wix.com
**Slot:** 40 minutes, including questions
**Format:** Monaco-based presentation with code, Mermaid diagrams, staged comparisons, and a short executable demo.

## Central argument

Architecture determines how much context an agent needs, how safely it can change something, and how quickly it can discover that it was wrong.

**Lower the intelligence required to make a correct change.**

Make routine work tractable for smaller models so frontier models can spend their reasoning on genuinely difficult problems. Treat the efficiency benefit as a hypothesis to test on representative tasks, not a guarantee about every model or codebase.

The story follows a complete change loop:

**Understand → change → verify → release → observe → improve.**

Recurring question: **How can an agent know it made the right change?**

Three budgets help connect the topics:

- **Context:** how much information is needed to understand and review the change?
- **Feedback:** how long does it take to discover a mistake?
- **Change:** how much behavior can change before verification becomes difficult?

## Punch lines to retain

- Lower the intelligence required to make a correct change.
- Small public surfaces. Cohesive implementations. Explicit contracts.
- Every change should leave the next change easier.
- Optimize for accepted changes, not generated lines or tokens per attempt.
- The context window is a ceiling, not a PR budget.
- Decouple progress from waiting; keep acceptance coupled to evidence.
- A green check belongs to a specific revision.
- Give the agent a profile, not a guess.
- A deployed change is not a proven outcome.
- Do not require exceptional intelligence for routine changes. Make correct changes ordinary.

## Code design: small context, deep modules

Start with cohesive packages, focused functions, meaningful names, explicit dependencies, and predictable entry points. Keep orchestration readable and errors and effects visible.

Qualify the original “small packages, small functions” message: splitting one concept across many tiny modules can increase the knowledge and navigation required. Line counts are review signals, not the objective.

### Matt Pocock and John Ousterhout

Pocock's skills advocate **deep modules**, drawing on Ousterhout's *A Philosophy of Software Design*:

- A module may be a function, class, package, or larger slice.
- Its interface includes every fact callers need: types, invariants, ordering, errors, configuration, and performance characteristics.
- Depth means useful behavior behind a small interface, rather than a large implementation-line count.
- Locality concentrates related knowledge, changes, bugs, and verification.
- Internal helpers can stay small without becoming public packages.
- The deletion test asks whether removing the module would spread complexity across callers or simply remove indirection.
- A seam should have a real reason to vary; avoid speculative ports and pass-through layers.
- Explore substantially different interfaces before choosing one: minimal surface, easiest common usage, or justified flexibility.

Ousterhout's position is not identical to strict interpretations of Clean Code; method length and comments are explicit areas of disagreement. Present the tradeoff rather than treating all design schools as interchangeable.

### Before/after examples

**Shallow quotation workflow:** the caller coordinates validation, catalog lookup, subtotal, discounts, shipping, and formatting. Every caller must remember that shipping eligibility uses the discounted subtotal.

**Deeper quotation module:** the caller invokes `quotes.quote(request)`. The module owns calculation order and exposes a contract for units, errors, and results. Package exports keep internal helpers out of the supported interface.

**Shipping policy:** contrast nested conditions with explicit guard clauses, then show independent behavioral examples. Preserve express priority, membership rules, and the 4999/5000-cent threshold.

Use clear BAD, BETTER, and GOOD labels. “Better” should not imply every problem has been solved.

### SOLID and disciplined patterns

Teach principles through the example rather than reciting acronyms:

- Separate use-case rules from transport and persistence.
- Depend on small contracts whose implementations preserve observable behavior.
- Give expected extensions a predictable home.
- Use Strategy for varying policy, Adapter for external systems, and Registry/Factory for explicit selection where justified.
- Include completion, failure, cancellation, and cleanup in lifecycle contracts.
- Avoid architecture that creates more concepts than it hides.

## Design signals and housekeeping

Use metrics to locate expensive understanding and risky change, not to produce one universal quality score.

| Technique | Useful question |
| --- | --- |
| CRAP | Where does complexity lack test coverage? |
| Cognitive complexity | Where is control flow difficult to follow? |
| Change hotspots | Which difficult areas are repeatedly modified? |
| Change coupling | Which supposedly separate modules keep changing together? |
| Dependency checks | Are forbidden imports and cycles rejected automatically? |
| Mutation testing | Would tests catch plausible implementation errors? |
| Extension exercises | Can another implementation be added without changing unrelated orchestration? |

### CRAP example and caveats

Using coverage as a fraction from 0 to 1:

`CRAP = C² × (1 − coverage)³ + C`

For complexity `C = 6`, illustrative coverage inputs give:

| Assumed coverage | CRAP |
| --- | ---: |
| 0% | 42 |
| 50% | 10.5 |
| 100% | 6 |

These are worked assumptions, not a measured analyzer report. The original definition uses basis-path coverage; actual tools may use different inputs. Record the analyzer and coverage definition when reporting real scores.

Both shipping implementations retain complexity 6 under the stated counting convention. Guard clauses improve nesting and readability without removing decisions. Tests protect policy, but high coverage alone does not prove assertion quality. Extracting methods solely to lower scores can distribute complexity instead of resolving it.

### Every PR gets review and cleanup

- Check responsibility boundaries, names, duplication, coupling, and unnecessary abstractions.
- Remove obsolete code and temporary scaffolding.
- Keep examples, tests, package instructions, and architecture decisions current.
- Apply the Boy Scout rule to the touched area.
- Put larger cleanups in separate, preferably stacked PRs so behavioral changes remain reviewable.

## System architecture

Use one order-processing example throughout so the audience can reuse context.

- Show ownership, APIs, events, data stores, external dependencies, and failure paths.
- A modular monolith can provide excellent boundaries; microservices are not automatically more AI-friendly.
- Define compatibility, retries, timeouts, idempotency, cancellation, and partial-failure behavior.
- An idempotency-key field is insufficient without a persistence and atomicity policy.
- The order/outbox example requires atomic persistence and an explicit delivery/deduplication policy.
- Make package boundaries executable through exports, dependency rules, cycle checks, and adapter contracts.
- Retain human ownership of requirements, tradeoffs, and production outcomes.

## Repository context and token efficiency

Make the repository explain itself through nearby purpose statements, public contracts, invariants, examples, ownership, and verification commands.

- `AGENTS.md`: scoped repository instructions.
- Skills: reusable workflows and discipline.
- Glossary: shared domain language.
- ADRs: important decisions and their reasons.

Prefer targeted retrieval and concise, useful tool output over loading everything. Do not omit necessary evidence merely to save tokens. Measure **tokens and cost per accepted change**, including retries and review effort.

## Fast, readable tests

Tests are executable intent and regression guards that preserve velocity.

- Use the repo's fluent-tests approach: domain language, Given–When–Then structure, small builders and drivers.
- Hide infrastructure setup without hiding a second implementation of production logic.
- Use deterministic async control and isolated state.
- Expected values come from requirements or independent worked examples.
- Test the public behavior of the module; avoid asserting incidental helper-call order.
- Keep focused tests, adapter/contract checks, and critical end-to-end paths.
- Replace redundant implementation-coupled tests carefully when deepening modules; retain distinct behavior and integration guarantees.
- Use boundary cases and selective mutation testing to challenge test strength.

The live rule demo changes `total > 0` to `total >= 0`; the zero case must reject the change. An implementation and its agent-written tests can share the same misunderstanding, so independent acceptance criteria matter.

## Builds, CI, and unavoidable waiting

Fast and reproducible builds are separate promises. Pin runtime and dependencies, declare inputs, avoid undeclared machine state, and use correctly keyed caches and incremental work. Keep broader integration checks as a backstop to affected-package checks.

When long cycles are inevitable, use a verification ladder:

**Static checks → focused tests → affected packages → integration suites → release checks.**

- Run cheap falsifiers first and expensive checks early.
- Overlap checks with useful work; avoid duplicate runs for every intermediate edit.
- Batch deliberately when setup or queue time dominates.
- Keep passed, running, failed, and not-checked states distinct.
- Partial evidence permits experimentation; it does not replace required acceptance gates.
- Stop building on a disproven assumption.

### Remote development and CI as agent capabilities

| Environment | Typical role |
| --- | --- |
| Local computer | Editing, inspection, quick checks |
| Remote development machine | Interactive work needing more resources, services, or persistent caches |
| CI | Repeatable checks with durable evidence and merge/release gates |

Choose by queue + setup + execution + feedback-retrieval time, not CPU capacity alone. A congested local computer is a reason to consider offloading, not proof that CI is faster.

An offload skill should define approved commands/workflows, resource triggers, scoped credentials, immutable source revision, run ID, check scope, logs and artifacts, result interpretation, and rerun behavior. Distinguish infrastructure failures from code failures.

**Dispatch → track → inspect → fix → rerun.** A green run for an old revision is not evidence for newer code.

## Small PRs, stacks, and independent review

Keep a PR comfortably within the reviewer/model's reasoning budget. That budget includes the diff, callers, contracts, tests, instructions, and room to reason. A small shared-interface change can require more context than a larger isolated addition.

One purpose per PR. Separate mechanical refactoring from behavior changes.

Example stack:

1. Notification contract.
2. Email adapter.
3. Integration behind a flag.
4. Rollout and monitoring.

Stacks decouple continued development from merge readiness. Review against the immediate parent, maintain valid intermediate states, merge in dependency order, and verify the integrated result. Parent changes can invalidate descendant evidence. Keep stacks manageable and reassess work built on failed foundations.

Give a separate reviewer agent fresh context: requirements, diff, relevant contracts, and verification results. Ask for counterexamples and reproducible findings. Separate roles do not guarantee independent judgment; retain deterministic checks and human accountability.

## Deployment, monitoring, and production learning

“Fearless deployments” means evidence, containment, and recovery:

- Small releases, flags, progressive rollout, health gates, and clear stop criteria.
- Bounded permissions and explicit authority for consequential actions.
- Compatibility and expand–migrate–contract data changes.
- Application rollback does not necessarily undo data changes.

Connect release identity to traces, errors, latency, resource use, and business outcomes. A 200 response may still represent duplicate orders or lost notifications.

Close the learning loop:

**Production signal → reproduce → regression test/benchmark → bounded fix → controlled rollout → compare outcomes.**

## Performance as day-to-day engineering

Give agents profiling skills and repeatable capture commands, not just a request to “make it faster.”

| Evidence | Question |
| --- | --- |
| CPU profile / flame graph | Where does execution time go? |
| Allocation profile | What produces allocation and GC pressure? |
| Heap snapshots / retention paths | What stays reachable as memory grows? |
| Traces and off-CPU analysis | Where do dependencies, locks, or I/O cause waiting? |
| Utilization, saturation, errors | Which resource is actually constrained? |

Define a representative workload and baseline, form one hypothesis, make a bounded change, and repeat the workload. Check latency distributions, throughput, resource cost, and correctness. Preserve environment details and handle sensitive profiling artifacts appropriately.

Keep noisy or expensive performance checks outside the fastest loop. Confirm improvements during rollout. The current CPU call-tree diagram is illustrative, not a measured profile or benchmark.

## Presentation plan and examples

The current draft has **33 slides**, with multi-step comparisons on the design examples. See [speaker rundown](docs/speaker-rundown.md) for the exact sequence and timing, and [deck YAML](content/deck.yaml) for authoritative on-screen content and notes.

Current timing: **34:15 speaking + 1:45 transition/recovery buffer + 4:00 questions**. These are rehearsal estimates, not automatic advances.

The narrative runs from thesis and measurement through code design, architecture, context, tests, builds, slow-feedback strategies, PRs, deployment, performance, and the demo.

Presentation choices:

- One argument per slide; a new argument usually deserves a new slide.
- Keep detailed caveats and references in notes, with key qualifications visible on screen.
- Use the same order example across topics.
- Make bad/good comparisons explicit with words and color, not color alone.
- Use temporary suggestion edits and smooth zoom to focus attention on the demo.
- Suppress diagnostic squiggles for illustrative snippets while keeping explicit run-check failures.
- Keep stage typography readable and chrome out of the way.
- Rehearse a deterministic fallback for the live demo.

## Open refinements and evidence to collect

- Capture a real, safe-to-share CPU profile to replace or accompany the illustrative call tree.
- Gather comparable before/after task results: correctness, tokens, retries, elapsed time, and human review effort. Do not invent savings.
- Consider a real PR-stack/CI trace showing useful overlap and revision-specific evidence.
- Rehearse all beats within the slot; shorten detail or move material to backup content if needed.
- Review text, diagram fit, and contrast at the actual stage resolution in both themes.
- Keep metric formulas, detailed adapter mechanics, and profiling commands available as backup discussion material.

Closing checklist: **Easy to locate? Easy to understand? Cheap to verify? Safe to release? Observable afterward?**

## Sources discussed

- [Matt Pocock: skills repository](https://github.com/mattpocock/skills)
- [Codebase design: deep modules and vocabulary](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md)
- [Deepening: dependencies, adapters, and test strategy](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/DEEPENING.md)
- [Design it twice](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/DESIGN-IT-TWICE.md)
- [Architecture improvement workflow](https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md)
- [Pocock: good and bad tests](https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/tests.md)
- [John Ousterhout: A Philosophy of Software Design](https://web.stanford.edu/~ouster/cgi-bin/book.php)
- [Alberto Savoia: original CRAP explanation](https://testing.googleblog.com/2011/02/this-code-is-crap.html)
- [Sonar: cognitive complexity](https://www.sonarsource.com/resources/cognitive-complexity/)
- [Stryker: mutation testing](https://stryker-mutator.io/docs/)
- [Brendan Gregg: performance analysis methodologies](https://www.brendangregg.com/methodology.html)
- [Brendan Gregg: USE method](https://www.brendangregg.com/usemethod.html)

Sources above were consulted during the discussion. Links to repository main branches can change; pin source revisions before quoting version-sensitive skill instructions in published material. The example code and presentation outline are our illustrative adaptations, not code copied from Pocock's package.
