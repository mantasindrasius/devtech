# Monaco Slides

33 slides for a 40-minute talk: **Designing Architectures that AI can work with**, by **Mantas Indrašius, Dev Lead at Wix.com**.

## Run

For the standalone server + React deep-module example with SQLite and a rhombus-shaped
test suite, see [Field Supply](example-app/README.md). Run it with `bun run example-app`;
the command starts its own server and opens your browser. Verify it with `bun run test:example`.

Use Bun 1.4.4 (pinned in `package.json`), then:

```sh
bun install
bun run dev
```

For CI or a reproducible install, use `bun install --frozen-lockfile`.

Open the local URL printed by Vite. `bun run build` creates a static site in `dist/`; `bun run preview` previews that build.

## Present

- Use the explorer, arrow buttons, or left/right arrow keys to move between slides.
- Press **F** or click **Present** for fullscreen.
- Press **N** to toggle speaker notes.
- Code is a real Monaco TypeScript editor. Edits are saved locally in this browser. **Reset** restores the current example.
- Navigation shortcuts are suspended while editing code. Click outside the editor to resume slide shortcuts.
- On slide 31 (the live demo), **Run checks** compiles and executes the edited example in a disposable worker with a three-second timeout. Change `> 0` to `>= 0` to demonstrate a failing assertion.

Edit `content/deck.yaml` for slide content, notes, and transition steps. Code snippets live in `content/snippets/`; Mermaid diagrams live in `content/diagrams/`. See [Authoring and extension contracts](docs/authoring.md). Styles are grouped in `src/styles/`. Fonts use Google Fonts with local fallbacks; Monaco and its workers are bundled locally.

## In-slide transitions

The next/previous controls move through beats before changing slides. **Replay slide** restarts the current sequence. Clicking an explorer entry jumps directly to that slide.

Most slides show one complete idea per advance. Slides 5 and 6 compare shallow/deep modules and nested/clear shipping rules across multiple beats; slide 9 explains CRAP using explicitly hypothetical coverage values. Slide 31 runs the original example, animates a temporary edit from `> 0` to `>= 0`, then runs checks to expose the zero-case regression. The demo preserves saved editor code.

See [Speaker rundown](docs/speaker-rundown.md) for the 33-slide sequence and rehearsal timing. Speaker notes include talking points, technical qualifications, and source links. The plan allows 34:15 of speaking, 1:45 of transition/recovery time, and four minutes for questions.

Text and typing effects respect reduced-motion preferences. Actions are registered in `src/steps/register-actions.js`; the generic timeline lives in `src/core/timeline.js`. Vite explicitly polls files to avoid stale previews in environments where filesystem notifications are unavailable.

### Architecture diagram

The deck references diagrams for architecture, context, verification, PR stacks, deployment, and feedback loops. Use **Mermaid source** to inspect each definition. Edit the referenced files in `content/diagrams/`. The CPU diagram is explicitly illustrative; it does not claim measured profiling results.

Mermaid is bundled locally by Vite. It loads lazily when the diagram is shown, without a CDN request. If rendering fails, the referenced Mermaid source and an error are shown. Bun reads registry settings from your user-level configuration; keep using the host’s private registry for installs. Keep machine-specific registry settings out of the repository.

## Registry checks before pushing

`bun install` enables Husky through the `prepare` script. The pre-push hook scans all outgoing commit trees for the host-specific private registry hostname and blocks a push if it finds one. Branch deletions are allowed. The check prints filenames, never matched file contents.

```sh
bun run registry:sanitize   # Replace private registry URLs in tracked working-tree files
bun run registry:check      # Check the current HEAD commit
bun run test:registry       # Test URL conversion and outgoing-history checks
```

To sanitize a new, untracked file, pass it explicitly: `bun run registry:sanitize -- bun.lock`. Review the result, then commit it. If an outgoing commit already contains a private-registry reference, amend or rebase that commit; adding a cleanup commit will still be blocked. The sanitizer does not change your user-level npm registry configuration, dependency versions, or integrity hashes.

Hooks are a local safeguard and can be bypassed; enforce the same policy in CI if server-side enforcement is needed.
