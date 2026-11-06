# Monaco Slides

Three interactive slides for **Designing Architectures that AI can work with**, by **Mantas Indrašius, Dev Lead at Wix.com**.

## Run

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates a static site in `dist/`; `npm run preview` previews that build.

## Present

- Use the explorer, arrow buttons, or left/right arrow keys to move between slides.
- Press **F** or click **Present** for fullscreen.
- Press **N** to toggle speaker notes.
- Code is a real Monaco TypeScript editor. Edits are saved locally in this browser. **Reset** restores the current example.
- Navigation shortcuts are suspended while editing code. Click outside the editor to resume slide shortcuts.
- On slide three, **Run checks** compiles and executes the edited example in a disposable worker with a three-second timeout. Change `> 0` to `>= 0` to demonstrate a failing assertion.

Edit `src/slides.js` to change the talk content and notes. Edit `src/style.css` to adjust the visual design. Fonts use Google Fonts with local fallbacks; Monaco and its workers are bundled locally.

## In-slide transitions

The next/previous controls move through beats before changing slides. **Replay slide** restarts the current sequence. Clicking an explorer entry jumps directly to that slide.

1. Introduction: reveal the description, then speaker and principles, then the takeaway.
2. Boundaries: reveal the explanation, then open Monaco's actual context menu at `OrderStore`. Its actions are interactive. Dismiss the menu or click the next button to continue.
3. Feedback: reveal the explanation, imitate replacing `total > 0` with `total >= 0`, then run the changed example to demonstrate the failing zero case. The animation uses a temporary model and preserves saved code. Replay or Reset restores the original editor model.

Text and typing effects respect reduced-motion preferences. Transition code lives in `src/transitions.js`. Vite explicitly polls files to avoid stale previews in environments where filesystem notifications are unavailable.

### Architecture diagram

Slide two now includes an architecture beat before its context-menu demo. It shows the HTTP controller, domain use case, `OrderStore` interface, SQL adapter, test adapter, and database. Use **Mermaid source** to inspect the diagram definition in the slide; edit it in `src/architecture.js`.

Mermaid is bundled locally by Vite. It loads lazily when the diagram is shown, without a CDN request. A local HTML diagram remains available if rendering fails. Package installs inherit your user-level npm registry configuration. Keep machine-specific registry settings out of the repository.
