---
name: clean-code
description: Write and review small, readable JavaScript and TypeScript modules in Monaco Slides. Use when implementing or refactoring functions, splitting files, simplifying control flow, or reviewing code quality.
---

# Clean Code

Keep code readable at its natural formatting size. Do not compress statements, markup, or CSS into long lines to meet size targets.

## Size guidelines

These are review thresholds, not automatic failure gates or reasons to expand the task:

| Unit | Preferred shape | Review trigger |
| --- | --- | --- |
| Source file | One responsibility, usually under 250 lines | Above 300, look for independent responsibilities; above 500, propose concrete module boundaries |
| Function | One operation and abstraction level, usually 5–20 lines | Above 40, look for named suboperations; above 60, normally split unless one unit is clearer |
| Nesting | At most two levels in ordinary control flow | Beyond three, use guards or extract a coherent operation |
| Parameters | Up to three independent inputs | Beyond four, check responsibility and consider named options |

Do not split declarative slide data, readable tables, or a cohesive algorithm merely to meet a count. Do not replace local variables with shared mutable state to shorten a function. Explain meaningful exceptions in the change summary when they affect review.

## Readability rules

- Name functions for actions and variables for domain meaning. Prefer `restoreEditorModel` to `handle`, `data`, or unexplained abbreviations.
- Keep orchestration readable top-to-bottom; move implementation detail into named helpers. A single obvious expression needs no helper unless it names a domain rule.
- Use guard clauses for invalid or terminal cases. Avoid boolean parameters selecting unrelated behaviors; prefer named operations or explicit modes.
- Give units to timing/distance values (`typingDelayMs`, `focusOffsetPx`). Extract repeated or policy-defining values, not every literal.
- Separate pure transformations from I/O. Make mutations and errors visible at boundaries. Catch errors only for defined recovery or useful added context.
- Comments explain intent, invariants, and tradeoffs rather than syntax. Delete obsolete code instead of commenting it out.
- Extract duplication when it represents the same rule. Similar-looking code with different reasons to change may stay separate.
- Name cohesive modules instead of collecting unrelated helpers in `utils`, `common`, or `manager`. Keep exports small and avoid circular dependencies.
- Apply these rules to test helpers too. A giant driver hiding a second implementation of production logic is not clean code.

## Scope and verification

Improve the touched path first. If a large existing file needs a broader split, name the responsibilities and candidate modules, and separate that follow-up from the requested change. Do not silently reorganize the application.

For behavior changes, use focused tests that would fail for the relevant regression. For refactoring, preserve existing behavior and run affected checks. Build when imports or bundling change; claim visual correctness only after observing the browser.
