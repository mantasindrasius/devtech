# Working in Monaco Slides

Read the relevant repository skills before implementing, refactoring, reviewing, or testing code:

- [Extensible design](.agents/skills/extensible-design/SKILL.md): design patterns, explicit extension points, composable behaviors, and extension contracts.
- [SOLID design](.agents/skills/solid-design/SKILL.md): responsibilities, contracts, dependencies, and lifecycle ownership.
- [Clean Code](.agents/skills/clean-code/SKILL.md): small files and functions, naming, control flow, and focused refactoring.
- [Fluent tests](.agents/skills/fluent-tests/SKILL.md): behavior-focused Bun tests, builders, drivers, and deterministic async checks.

Apply these to the requested change. Existing oversized modules are not permission for an unrelated rewrite. Documentation-only edits do not require production refactoring.

Prefer extending behavior through implementations, registration, and composition over adding feature-specific branches to core orchestration. Design patterns are encouraged where they make this extension path explicit.

## Project conventions

- Use Bun, with the version pinned in `package.json`. Use `bun install --frozen-lockfile` for reproducible installs and `bun run build` for build verification.
- Use the host's configured private package registry for installs. Never commit its URL or credentials. Keep machine-specific registry configuration outside tracked files.
- Run `bun run registry:sanitize -- bun.lock` after dependency changes and inspect the diff. Keep Husky's pre-push check enabled; do not bypass it to publish a failing commit.
- Run focused tests with `bun test <path>`; the registry suite is `bun run test:registry`. Report the checks actually run and distinguish a passing build from browser verification.
- Preserve user-authored code and saved editor models during presentation demos. Keep animations cancellable and honor reduced-motion preferences.
