# Authoring a deck

`content/deck.yaml` is the entrypoint. The format follows Scenic Engine's named scenes, per-scene transitions, and relative resource paths, adapted to a two-column Monaco presentation. It does not interpret Scenic Engine's 3D scene schema or expression language.

## Content and assets

- Metadata: `version: 1`, a stable deck `id`, `title`, and presenter `name`, `role`, `company`, `initials`.
- `resources`: named assets with a registered `type` and a `file` relative to `content/`. Paths cannot be absolute, remote, or traverse outside that directory.
- Code resources use `type: code` and `language: typescript` or `javascript`.
- Diagram resources use `type: mermaid`, a `.mmd` file, a `title`, an accessible `description`, and an optional `caption`.
- `slides`: ordered entries with stable IDs. A slide's `code` references a code resource. Titles are lists of `{text, accent}` lines, rendered as text rather than executable HTML. Description, takeaway, and speaker notes are YAML strings.
- Set `hidden: true` on a slide to exclude it from navigation, the sidebar, and the slide count. Omit the flag or set `hidden: false` to restore it. URL numbers refer to the visible slide order. Hidden slides and their resources remain in the source and are still validated; at least one slide must be visible.

```yaml
resources:
  order-contract:
    type: code
    file: snippets/order-contract.ts
    language: typescript
  architecture:
    type: mermaid
    file: diagrams/order-service.mmd
    title: Order service
    description: The use case depends on an interface implemented by adapters.
```

These example filenames are illustrative; reference existing assets or add the files first. All content files are bundled locally by Vite. The code is displayed as raw text, never imported as application code. Explicit Run checks executes the current TypeScript or JavaScript example in a disposable worker.

## Steps

Each slide has a non-empty `steps` list. Every step has a unique `id` within that slide and a `label`. Next/previous traverses steps before slides; Replay returns to the first step.

```yaml
steps:
  - id: opening
    label: The contract
  - id: explanation
    label: Explain the boundary
    reveal: [description]
  - id: architecture
    label: Show the architecture
    panel: architecture
  - id: edit
    label: Demonstrate a regression
    actions:
      - type: type-edit
        find: total > 0
        replacement: total >= 0
        typingDelayMs: 100
        holdMs: 700
        zoom: true
```

`reveal` accumulates through the selected step. Supported targets are `description`, `author`, `principles`, and `takeaway`. Set `author: true` or a `principles` list on the slide to provide that content.

`panel` applies only to that step. Without it, the slide's code resource is shown. It can reference another registered resource renderer.

Actions execute in listed order. Built-ins:

| Type | Options | Behavior |
| --- | --- | --- |
| `context-menu` | `target` | Open Monaco's native menu at the first matching string |
| `type-edit` | `find`, `replacement`, optional `typingDelayMs`, `holdMs`, `zoom` | Replace the first match in a temporary model with suggestion highlighting and optional camera motion; currently single-line expressions |
| `run-checks` | none | Compile and run the current example; requires slide `runnable: true` |

When navigating, prior actions reconstruct their final state without animation. The selected step runs interactively. Context-menu and check actions do not repeat while reconstructing prior steps. Typing state persists until navigation rebuilds or disposes it. Cancelling a step cannot modify a newer slide. Reduced motion applies edits immediately and skips camera movement.

Edits to saved code are keyed by deck/resource ID; keep IDs stable when rearranging slides. The original three examples migrate old index-based local storage on first access. Reset restores the YAML-referenced snippet.

## Validation and development

Run `bun run content:check` for YAML syntax, required fields, IDs, resource paths, references, action kinds, and options. `bun run build` includes this check. Mermaid syntax is checked by its renderer in the browser; rendering failures show the source and an error rather than a misleading substitute diagram.

Run `bun test tests` for loader, lifecycle, editor adapter, and extension tests. Use `bun run dev` to preview changes. These tests use controlled editor boundaries and do not certify actual browser layout.

# Extending behavior

## Command registry

Register a new action in `src/steps/register-actions.js`. Put its implementation in its own module. No timeline changes or slide-index branches are needed.

A definition provides `validate(options, slide)` and `create(options, context)`. A created command provides:

- `run({ signal, animate })`: return a promise that resolves when its effect is complete. `animate: false` reconstructs final state without visual playback. Transient actions may skip reconstruction.
- `dispose()`: synchronously release owned state, idempotently. Observe the abort signal to prevent future work; disposal restores temporary state.

The timeline aborts the active run before disposing commands in reverse creation order. A command that throws is cleaned up and reports an error. Registration rejects unknown or duplicate kinds. Add a small extension test proving your command works through this public contract.

## Renderer registry

Register resource renderers in `src/renderers/register-renderers.js`. Each definition validates metadata and creates `{ panel, show(), hide(), dispose() }`. The panel host owns instances; renderers own their DOM and async rendering work. Ignore late completions after disposal. Keep rendering dependencies in adapters rather than in the timeline or content loader.

Use `type: svg-illustration` with a repository-authored `.svg` file, `title` and `description`
for static illustrations. Reference it through a step's `panel`; `layout: visual` gives it
the full slide. Inline SVG can use the deck's theme variables and the chart classes in
`src/styles/svg-illustration.css`. This renderer is for trusted authored assets.

The `planet-evolution` renderer uses an SVG resource with `title` and `description` metadata.
Use it with `layout: visual` and steps referencing the same panel, each with a `caption` and
one of these `scene` values: `monolith`, `microservices`, `ai-era`. Each step waits for the
presenter's next input; animation within a scene never advances the timeline. CSS owns
formation, rotation, growth and eruptions, stops animations when the panel is hidden, and
disables motion when the viewer requests reduced motion. The SVG layers use `data-appears-at`
and optional `data-disappears-at` with zero-based scene indexes.

Planet surfaces and asteroid belts are generated when the panel is created. An empty
`<g data-paint="…">` in the SVG is filled by the painter registered under that kind in
`src/renderers/planet-painters/planet-painters.js`; its other `data-*` attributes are the
painter's options. Every painter takes an integer `data-seed`, so the art is identical on
every render.

| `data-paint` | Options | Result |
| --- | --- | --- |
| `jovian` | `data-spin-seconds` | Banded gas giant: modules are storms, dependencies are gas streams |
| `rocky` | `data-spin-seconds`, `data-module-columns` (4 or more), `data-module-names` (comma-separated) | Cratered planet: modules are named mountains joined by ridges |
| `volcanic` | Same as `rocky` | Io-like surface: modules are named volcanoes joined by lava rivers, plus one newly erupting volcano per column |
| `asteroid-belt` | `data-lane` (SVG path between two planets) | Rock streams drifting both ways |

A `volcanic` surface given the same seed, spin time and module options as a `rocky` one
raises its volcanoes exactly where the mountains stand, so one can fade into the other. A planet has two
rows of modules, so give it twice as many names as columns.

Surface painters draw inside a disc of radius 200, so place them in a group clipped by
`#pe-disc` and scale that group to the planet's size. Set `--planet-scale` to the same
scale on the planet's `pe-service` group so module names keep one on-screen size.

## Module map

- `src/content`: parse, validate, and resolve content.
- `src/core`: generic registry, cancellable sequencing, scheduler.
- `src/steps`: registered actions.
- `src/editor`: Monaco setup, persistent models, temporary edits, suggestion decorations, code runner.
- `src/effects`: browser camera adapter.
- `src/renderers`: resource renderers and panel ownership.
- `src/ui`: shell, deck view, controls.
- `src/main.js`: composition root and disposal.

## Example assessment banners

Code resources can include an optional assessment, displayed above the editor:

```yaml
example:
  kind: bad # bad, better, or good
  summary: The caller owns the pricing workflow
```

Labels use text plus red, amber, or green styling in both themes. Unmarked resources
have no banner. Monaco diagnostic markers are disabled for illustrative snippets;
explicit **Run checks** still compiles and executes runnable examples.
