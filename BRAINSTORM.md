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

## Wire feedback into the code

Observability and verification should be designed into the implementation, not added only after an incident. For each important operation, ask: **What evidence will tell a test, an agent, or an operator whether this behaved correctly?**

Use the same domain language across code, tests, logs, metrics, traces, and runbooks. An order being accepted, persisted, queued for notification, and delivered are different facts; instrument the actual milestone rather than calling them all “success.”

| Mechanism | What it contributes | Design discipline |
| --- | --- | --- |
| Structured logs | Explain decisions and failures with useful context | Stable event names, outcome/reason fields, correlation and release identifiers; avoid secrets and unnecessary personal data |
| Metrics | Reveal rates, distributions, resource pressure, and business outcomes | Bounded labels, useful units, explicit denominators; keep request/order IDs out of metric labels |
| Traces | Connect work and waiting across modules and systems | Propagate context across requests, queues, retries, and background work |
| Domain-level observation hooks | Let tests and production adapters observe meaningful milestones | Small typed contracts; preserve ordering and define whether events represent attempts or completed effects |
| Injected clocks, schedulers, IDs, and external adapters | Make scenarios reproducible and faults controllable | Substitute genuine dependencies rather than adding production branches such as `if (isTest)` |
| Health and diagnostic surfaces | Support rollout verification and troubleshooting | Expose bounded, actionable state without exposing mutable internals or creating unsafe control paths |

### Example: one feedback contract, several consumers

Illustrative contract for an order-intake module:

```ts
type OrderFeedback =
  | { kind: 'order.persisted'; operationId: string; durationMs: number }
  | { kind: 'order.rejected'; operationId: string; reason: 'invalid-total' }
  | { kind: 'order.failed'; operationId: string; reason: 'storage-unavailable' };

interface OrderObserver {
  record(event: OrderFeedback): void;
}

// Production: translate events into structured logs, metrics, and traces.
// Tests: capture events in memory and await the operation's completion.
// Keep telemetry adapters out of the domain's business decisions.
```

This is an example of an observation seam, not a requirement to build a universal event framework. Use existing instrumentation where it already provides the required evidence.

- Emit `order.persisted` only after the relevant persistence guarantee holds. A function being entered or a write being scheduled is not proof of persistence.
- Define sampling, buffering, overhead, and observer failure behavior. Best-effort diagnostic telemetry should not accidentally fail an order; durable business or audit events need explicit reliability guarantees and a different delivery contract where appropriate.
- Ordinary behavior tests should still assert public outcomes. Assert feedback events when instrumentation itself is the contract under test; do not replace business assertions with log-message matching.
- Test representative failure paths: rejected input, unavailable dependencies, retry, timeout, cancellation, and duplicate requests. Use controllable adapters and schedulers instead of arbitrary sleeps.
- Make metrics and logging adapters respect cardinality, redaction, and runtime cost. Profiling should also check whether instrumentation has become significant work.
- Record which signals are required before rollout, what failure looks like, and which dashboard or query retrieves the evidence.

The agent workflow becomes: **change → targeted checks → inspect emitted evidence → verify in a controlled environment → compare production outcomes**. Link evidence to the exact revision, workload, and environment. Feed missing or misleading signals back into code and tests as concrete improvements.

Potential punch lines:

- **Design the evidence alongside the behavior.**
- **A useful module explains its outcomes without exposing its internals.**
- **Production feedback starts in the code review.**

## Documentation has a lifecycle too — Surmap reference

Reviewed the local Surmap sources on 2026-11-06:

- `~/Code/surmap/.agents/skills/pr-lifecycle/SKILL.md`
- `~/Code/surmap/.agents/commands/wrap-context-docs.md`

These are reference practices for the talk, not a wholesale adoption of Surmap's commands or rules in Monaco Slides.

### The documented lifecycle

| Stage | Where knowledge lives | What changes at the transition |
| --- | --- | --- |
| Discovery and planning | An owning area's `docs/<area>/1-WIP/` holds discovery, a changeset, and a PRD when appropriate | Capture current state, intended state, delta, verification, and workflow obligations |
| Draft implementation | The changeset's ordered workflow rows and nested TODOs carry progress and evidence | Keep the PR description synchronized; record outcomes rather than relying on conversation memory |
| Ready for review | Stable feature/package documentation plus a history entry | Execute verification, transfer final-state knowledge, remove this PR's temporary planning documents, push the wrap, then mark ready |
| Review and follow-up changes | Stable docs, commit history, PR state, checks, and review threads | Reconcile new behavior with docs again; earlier evidence may no longer describe the current revision |
| Merged | Current documentation and historical records | Readers should not need to reconstruct today's behavior from old plans or a sequence of changelog entries |

Surmap's main principle is **transfer knowledge, not just references**. A history entry alone is not a documentation update. Replace “will add retries” or “changed retry handling” with a current-state description of the retry policy, including limits and failure behavior.

### Details worth borrowing

- **Documentation completion is part of readiness.** Wrap at draft → ready, not while the work is still moving and not as an easily forgotten post-merge chore.
- **Plan documentation obligations early.** Identify affected package docs, feature docs, examples, operational guidance, and diagrams as part of the change.
- **One progress record with evidence.** Ordered `[wf]` rows and nested TODOs identify what ran, what remains, and the verification result. The PR carries the same record. A checklist tick is not a substitute for evidence.
- **Stable docs state current behavior.** Temporary plans describe intent and deltas; permanent docs describe the implemented contract. Avoid making stable documentation depend on transient planning paths or individual historical entries.
- **History is separate and append-only in meaning.** Surmap writes a separate dated file per change rather than repeatedly modifying one shared changelog, reducing conflicts between parallel branches.
- **Close or narrow deferred work deliberately.** Resolved records are removed with history retained in Git; partial work leaves an updated record describing only the remaining gap; deferred work retains its blocker and disposition.
- **Wrap stacks bottom-up.** Each PR owns its documentation update. Do not make a completed predecessor depend on a successor's temporary documents or edit another branch as part of the wrap.
- **New changes can invalidate old completion.** A follow-up diff may require another documentation pass and renewed verification. Use current code and evidence, not an obsolete completion label.
- **Check the documentation graph.** Validate links and references after deleting temporary documents. Update affected architecture diagrams to depict the resulting system.

The source describes a CI gate at `.github/workflows/docs-wip-wrap-check.yml` that rejects a ready PR still adding or modifying its own WIP documents. That file, and the referenced `docs/AGENTS.md`, were absent from the inspected checkout. Treat this as a documented enforcement intention; actual CI enforcement was not verified. The wrap procedure also contains conflicting wording about deleting deferred-work records; the explicit outcome table and Rules section distinguish resolved records from still-open ones.

### Connect documentation to the feedback loop

When a change introduces a metric, event, or verification hook, update the stable documentation with:

1. The behavior or invariant the signal represents.
2. Its units, dimensions, sampling, and known limitations.
3. A reproducible command, query, or scenario that obtains it.
4. How to interpret success, failure, and missing evidence.
5. Operational ownership and the relevant response or recovery procedure.

When production exposes a mistaken assumption, correct the code, regression guard, and current documentation together. Preserve why the decision changed in history or an ADR, while keeping the current behavior easy to find.

Suggested talk framing: **“The PR is ready when the next agent can understand the new reality—not just read the diff.”** This belongs with housekeeping, repository context, and PR review; it need not add a separate long section to the 40-minute slot.

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

### Design stamina, complexity, and AI cost per PR — research notes (2026-11-11)

**Keep the concepts separate.** Codebase size, cleanliness and complexity are different
variables. Readable code can implement a complex domain; splitting a function into helpers
may redistribute complexity and increase navigation rather than reduce it. Investigate
branching, cognitive complexity, coupling, dependency depth and the scope touched by a task.
Use tokens **per PR across the full lifecycle**: exploration, planning, implementation,
tests, agent reviews, fixes and CI-feedback iterations through merge. Sum all agents and
retries. Report abandoned work and merge/success rates separately to avoid survivor bias.
For aggregate efficiency, include abandoned-work spend in total tokens divided by merged
PRs; also track change scope so splitting PRs does not create artificial savings. Raw token
counts are not dollar cost: cached input, fresh input and output have different prices.

- **Adopted for the slide immediately after the planet animation:**
  [Martin Fowler — Design Stamina Hypothesis (2007)](https://martinfowler.com/bliki/DesignStaminaHypothesis.html).
  Conceptual cumulative functionality versus time; delivery velocity is the slope. It is not
  measured data and its x-axis is not codebase size. Preserve attribution and label the
  adaptation as conceptual. Do not claim a calibrated design-payoff date.
- [Google — Understanding Architectural Complexity, Maintenance Burden, and Developer Sentiment (2025)](https://research.google/pubs/understanding-architectural-complexity-maintenance-burden-and-developer-sentiment-a-large-scale-study/).
  1,200+ C++/Java projects and 7,200 survey responses. Propagation cost and architectural
  anti-patterns correlate with more LOC devoted to bug fixing rather than features. Relevant
  to architectural complexity and maintenance; not an AI-token-cost experiment.
- [Trivedi & Schmitt / SonarSource — Does Code Cleanliness Affect Coding Agents? (2026)](https://arxiv.org/html/2605.20049v1).
  Controlled minimal pairs: six repository pairs, 33 tasks, 660 trials, Claude Code with
  Sonnet 4.6. Table 2 reports 7.1% fewer input tokens, 8.5% fewer output tokens and 33.8%
  fewer revisits on cleaner code, with a −0.9 percentage-point pass-rate difference.
  Table 3 matters: multi-module tasks used 10.7% fewer input tokens; cognitive-hotspot tasks
  used 1.8% more. Cleanliness is a bundle of changes, not an isolated complexity variable.
  Vendor-authored preprint, one agent/model, task-dependent effects and outlier filtering.
  [Companion blog](https://www.sonarsource.com/blog/a-cleaner-codebase-results-in-less-token-usage/)
  reports 27 tasks / 540 runs and 7.2% input-token savings; do not mix its denominator with
  the paper's calibration-inclusive results. Save for discussion; do not present as a
  universal complexity-to-cost curve.
- [Hu et al. — Token-Aware Coding Flow (2025)](https://arxiv.org/abs/2504.15989).
  Preprint studying code smells, refactoring and prompting in reasoning models; reports
  token reductions up to 50%. Candidate follow-up for complexity-related smells. Check
  task definitions and raw versus time-/complexity-normalized metrics before charting;
  the headline is not a general per-task saving for production coding agents.
- [Bai et al. — How Do AI Agents Spend Your Money? (2026)](https://arxiv.org/html/2604.22750v1).
  Figure 4 associates expensive attempts with repeated file views and modifications;
  Figures 8–9 examine context accumulation and token-cost dynamics. Evidence about agent
  behavior and repeated work, not proof that cyclomatic complexity causes token growth.
- [Song et al. — Converted, Not Equivalent / T2J-Bench (2026)](https://arxiv.org/html/2605.29054v1).
  Figure 3(a) directly plots source LOC against mean tokens per conversion task across
  45 codebases. Correlation is −0.19, essentially flat in this benchmark. Important
  counterevidence to a universal size-to-token curve; bounded PyTorch-to-JAX conversion
  tasks do not establish a general law for feature development or maintenance.
- [CodeAlive — Context on large codebases (2026)](https://codealive.ai/en/blog/context-for-claude-code-and-cursor-on-large-codebases).
  Vendor reports 2.80M versus 767K tokens per task on a 1.5M-line repository when changing
  the retrieval/agent approach. Relevant to navigation, not an isolated size or complexity
  experiment. Verify benchmark definitions before reuse.

- [Gullstrand Heander et al. — CodeHealth Predicts the Token Cost of Agentic Code Review (October 2026)](https://arxiv.org/html/2610.21914v1).
  Observational preprint: 465 PRs, 246 repositories, three models, five-agent review/fix
  pipeline. Each CodeHealth point predicted 3.5–6.1% fewer tokens after accounting for
  changed lines, language and repository. The association concentrated in review iterations.
  Controlling for whole-file size absorbed it: size and health effects cannot be separated.
  CodeHealth combines multiple smells, not complexity alone. This measures review and fix,
  not original implementation, testing and CI through merge; it cannot calibrate our full
  lifecycle graph. The complexity-tax graph uses section 4.2 tier contrasts as normalized bars:
  unhealthy = 100; healthy = 65 / 71.1 / 78.2. These are fitted point estimates, not raw
  means; intervals are omitted on the slide. Full-lifecycle inference stays explicitly open.

**What “healthier code” means in this study:** CodeScene's CodeHealth is a composite
static-analysis score, not a synonym for fewer lines or more functions. It combines code
smells such as complex methods, deeply nested conditionals and duplicated logic. On its
1–10 scale, below 4 is unhealthy, 4 to below 9 is problematic, and 9–10 is healthy. The
graph compares the sample's median unhealthy score of 2.8 with its median healthy score
of 9.7. See the [study's definition, section 2.1](https://arxiv.org/html/2610.21914v1#S2.SS1).

Speaker framing: “Code that requires less effort to understand and safely change.” This
does not imply a simpler business domain, smaller functions everywhere, or more abstraction.
The study could not separate CodeHealth from the size of the files agents read: use it as
evidence for a maintainability argument, not a promise that raising a score saves tokens.

### Architectural modularity and cost of change — research notes (2026-11-11)

**Focus:** architectural modularity, not low-level method cleanliness. Investigate coupling
between modules, dependency cycles, change propagation, and how much of the system a change
requires understanding, coordinating, testing and deploying. Monolith versus microservices
is a deployment distinction, not a reliable proxy for healthy versus tangled architecture.

- [MacCormack & Sturtevant — Technical debt and system architecture: The impact of coupling on defect-related activity (2016)](https://www.hbs.edu/ris/Publication%20Files/2016-JSS%20Technical%20Debt_d793c712-5160-4aa9-8761-781b444cc75f.pdf).
  Two large systems; Table 6 estimates annual corrective-maintenance cost per LOC.
  Within system C: peripheral $0.71, shared $0.80, control $1.25, core $2.31.
  Core/peripheral ratio is approximately 3.25. These are allocated costs using total
  maintenance hours, $100/hour and defect-activity shares, not measured cost per PR.
  The financial comparison does not control for cyclomatic complexity. Adopted on the
  coupling-tax graph as four bars, retaining original units and caveats. The 3.25×
  callout is 2.31 / 0.71 from rounded published figures; it is not a refactoring saving.
- [Google / Cai et al. — Understanding Architectural Complexity, Maintenance Burden, and Developer Sentiment (2025)](https://research.google/pubs/understanding-architectural-complexity-maintenance-burden-and-developer-sentiment-a-large-scale-study/).
  1,200+ projects; propagation cost and structural anti-patterns correlate with a greater
  share of LOC spent fixing bugs rather than adding features. Supports the modularity
  argument at scale; not a price-per-change or AI-token measurement. Propagation cost is
  a dependency-reachability measure, not money spent.
- [Does microservice adoption impact the velocity? A cohort study (2025)](https://link.springer.com/article/10.1007/s10664-025-10673-7).
  265 open-source projects: 58 microservices and 207 monoliths. No statistically significant
  velocity difference found. Velocity here is average issue-open duration, not engineering
  hours per feature. No significant difference does not prove equivalence. Use to challenge
  automatic claims that microservices make changes cheaper, not to claim monolith superiority.

Suggested narrative: “Good boundaries keep a change local. A network boundary alone does
not.” Compare well-modularized and tangled designs within either deployment style. For
our own PR-level evaluation, measure modules/services touched, cross-module co-changes,
dependency reach, coordinated releases, verification scope and total agent tokens through
merge. These are proposed measurement dimensions, not a validated cost formula.

**Evidence still needed:** a controlled complexity-versus-full-lifecycle-cost-per-PR result holding
behavior, task, model, harness, tests and budgets stable. Treat “less task-relevant complexity
reduces exploration and retries” as a hypothesis to test, not a measured universal curve.
Measure both success and total tokens across attempts, with cache categories and monetary
cost separate. Avoid replacing “codebase size” on an existing chart with “complexity” while
retaining unsupported data points.

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

Graph sequence: design stamina → The coupling tax (architectural modularity) → The complexity tax (code-level maintainability). Keep both empirical comparisons distinct.

### How coding agents work — three-phase animation

Use Explore → Plan changes → Implement as a teaching model, with verification inside
implementation and feedback loops back to exploration/planning. Anthropic's published
workflow also includes commit; these phases are not a universal agent state machine.
[Workflow reference](https://academy.claude.com/es/courses/claude-code-101/the-explore-plan-code-commit-workflow).

Planning continues investigation: inspect callers and contracts, resolve ambiguity, choose
an approach, list affected files and define checks. A written plan is an artifact, not
necessarily a tool invocation. Plan mode proposes work before editing application files.
[Common workflows](https://code.claude.com/docs/en/common-workflows).

The slide uses illustrative Claude Code names: Read, Glob, Grep, LSP, Bash,
EnterPlanMode, AskUserQuestion, ExitPlanMode, Edit and Write. Edit performs targeted string
replacement; do not present StrReplace as Claude's exact tool name. Glob/Grep and LSP
availability vary; shell searches can serve the same purpose. Optional task-list tools
track work but do not themselves perform planning. Other available tools include Agent,
WebSearch/WebFetch, NotebookEdit, and TaskCreate/TaskUpdate where enabled; they need not
appear in every change. [Tool reference](https://code.claude.com/docs/en/tools-reference).

The slide starts with a title. Each click reveals one more phase and its independent
looping illustrative stream. These are simulated examples, not live calls or an exact trace.

### Composition roots for deep modules

[Mark Seemann — Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)
defines application assembly near the entry point. Use an application-specific bootstrap
module to construct modules and inject their public capabilities. A DI container is optional;
modules should not retrieve dependencies from a global container. Separate construction
from business orchestration. [Composition Root Reuse](https://blog.ploeh.dk/2015/01/06/composition-root-reuse/)
emphasizes that roots are application-specific.

The new side-by-side Monaco slide shows illustrative server and client factory APIs, not
third-party package documentation. Server: catalog → quotes → checkout, with infrastructure
adapters. Client: API + cart → checkout → React App, mounted with createRoot. Compose once outside
React render; inject capabilities through props, and unmount React before module disposal. The root owns lifetimes and disposes
in dependency order; modules own their subscriptions but not injected dependencies. Real
startup needs rollback on partial failure. React UI adapters can pass capabilities through
props or [scoped context](https://react.dev/learn/passing-data-deeply-with-context); context
distribution is not itself the whole composition root. Keep domain policies in deep modules.
