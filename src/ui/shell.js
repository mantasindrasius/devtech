export function mountShell(root) {
  root.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#1"><span class="brand-mark">m<span>_</span></span>monaco<span class="brand-sub"> / slides</span></a>
      <div class="project-name"></div>
      <div id="theme" class="theme-control" role="group" aria-label="Color theme">
        <button type="button" data-theme="light" aria-label="Light theme" title="Light theme" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg></button>
        <button type="button" data-theme="dark" aria-label="Dark theme" title="Dark theme" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14a9 9 0 0 1-10.5-10.5A9 9 0 1 0 20.5 14Z"/></svg></button>
      </div>
      <div id="typography" class="typography-control" role="group" aria-label="Font sizes"></div>
      <button id="present" class="quiet">▷ <span>Present</span><kbd>F</kbd></button>
    </header>
    <div class="workspace">
      <aside>
        <div class="explorer-label">EXPLORER <span>···</span></div>
        <div class="folder"></div>
        <nav aria-label="Slides"></nav>
        <div class="outline-label">IN THIS TALK</div><ol class="outline"></ol>
        <div class="sidebar-bottom"><span class="green-dot"></span>Built for live coding<br><small>Powered by Monaco Editor</small></div>
      </aside>
      <main>
        <div class="tabbar"><div class="active-tab"><span class="ts">TS</span><span id="tab-name"></span><span class="tab-dot"></span></div><span class="tab-caption">A presentation, in your element.</span></div>
        <div class="breadcrumb">talk <span>›</span><span id="crumb"></span><span>›</span><span class="breadcrumb-symbol">{ }</span> slide</div>
        <section id="slide" aria-live="polite">
          <div class="slide-copy">
            <div id="eyebrow"></div><h1 id="title"></h1><p id="description"></p>
            <div id="author"><span class="avatar"></span><div><strong></strong><span></span></div></div>
            <div class="principles"></div>
          </div>
          <div class="code-panel">
            <div class="code-toolbar"><span><span class="ts">TS</span><span id="code-file"></span></span><div><button id="reset">Reset</button><button id="run" hidden>▷ Run checks</button><span class="live-label"><span class="green-dot"></span>editable</span></div></div>
            <div class="example-banner" hidden><strong></strong><span></span></div>
            <div id="editor"></div><div id="output" role="status" hidden></div>
            <div class="code-footer"><span id="code-language"></span><span>UTF-8 / Monaco Editor</span></div>
          </div>
          <div class="takeaway"><span>↳</span><span id="takeaway-text"></span></div>
        </section>
        <footer class="navigation">
          <button id="notes-toggle" class="quiet">☰ Speaker notes <kbd>N</kbd></button>
          <div class="pagination"><span id="step-status" class="transition-status" role="status"></span><button id="previous" aria-label="Previous step">←</button><span id="counter"></span><button id="next" aria-label="Next step">→</button></div>
          <button id="replay" class="quiet">↺ Replay slide</button>
        </footer>
        <div id="notes" hidden></div>
      </main>
    </div>
    <div class="statusbar"><span>⑂ main <span class="status-divider">✓ All changes are local</span></span><span id="status-topic"></span><span>Made for developers</span></div>`;
  return (id) => root.querySelector(`#${id}`);
}
