import './style.css';
import { bindEditorTypography } from './editor/typography.js';
import { createThemePreference } from './theme/preference.js';
import { bindTheme } from './theme/controls.js';
import { loadBrowserDeck } from './content/browser-deck.js';
import { visibleDeck } from './content/visible-deck.js';
import { createTimeline } from './core/timeline.js';
import { wait } from './core/scheduler.js';
import { monaco, setupEditor } from './editor/setup.js';
import { createModelStore } from './editor/model-store.js';
import { createCodeAdapter } from './editor/code-adapter.js';
import { createCheckRunner } from './editor/check-runner.js';
import { createCamera } from './effects/camera.js';
import { registerActions } from './steps/register-actions.js';
import { registerRenderers } from './renderers/register-renderers.js';
import { createPanelHost } from './renderers/panel-host.js';
import { mountShell } from './ui/shell.js';
import { createDeckView } from './ui/deck-view.js';
import { bindControls, slideFromHash } from './ui/controls.js';

function start(root) {
  const actions = registerActions();
  const renderers = registerRenderers();
  const authoredDeck = loadBrowserDeck({ actions, renderers });
  const deck = visibleDeck(authoredDeck);
  const $ = mountShell(root);
  const editor = setupEditor($('editor'));
  const unbindTypography = bindEditorTypography(editor, $('editor'));
  const models = createModelStore(monaco, authoredDeck, localStorage);
  const theme = createThemePreference(localStorage);
  const unbindTheme = bindTheme({
    preference: theme,
    control: $('theme'),
    monaco,
    root: document.documentElement,
  });
  const codePanel = root.querySelector('.code-panel');
  const code = createCodeAdapter({ monaco, editor, models, panel: codePanel });
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const camera = createCamera({ editor, panel: codePanel, canvas: $('slide'), reducedMotion });
  const checks = createCheckRunner({ monaco, editor, output: $('output'), button: $('run') });
  const panels = createPanelHost({
    resources: deck.resources,
    renderers,
    context: { code, codePanel, editor, theme, monaco, resources: deck.resources },
  });
  const view = createDeckView({ deck, root, panels });
  const timeline = createTimeline({
    deck,
    actions,
    context: { code, checks, camera, wait, reducedMotion },
    view,
  });
  const unbind = bindControls({ root, timeline, code, checks, editor });
  void timeline.select(slideFromHash());
  return () => {
    unbind();
    unbindTypography();
    unbindTheme();
    timeline.dispose();
    checks.dispose();
    camera.dispose();
    panels.dispose();
    editor.dispose();
    models.dispose();
  };
}

try {
  const dispose = start(document.getElementById('app'));
  import.meta.hot?.dispose(dispose);
} catch (error) {
  const root = document.getElementById('app');
  root.replaceChildren();
  const message = document.createElement('pre');
  message.className = 'deck-error';
  message.textContent = `Unable to load presentation\n${error.message}`;
  root.append(message);
}
