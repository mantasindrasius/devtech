export function createDeckView({ deck, root, panels }) {
  const $ = (id) => root.querySelector(`#${id}`);
  const number = (value) => String(value).padStart(2, '0');
  populateNavigation(root, deck);
  document.title = `${deck.title} — ${deck.presenter.name}`;
  root.querySelector('.project-name').textContent = `${deck.id} / presentation`;
  root.querySelector('.folder').textContent = `⌄ ${deck.id.toUpperCase()}`;
  root.querySelector('.avatar').textContent = deck.presenter.initials;
  root.querySelector('#author strong').textContent = deck.presenter.name;
  root.querySelector('#author div > span').textContent =
    `${deck.presenter.role} at ${deck.presenter.company}`;

  return {
    show(state) {
      const { slide, slideIndex, stepIndex, step, first, last } = state;
      $('slide').dataset.layout = slide.layout ?? 'standard';
      $('slide').dataset.slideId = slide.id;
      const resource = deck.resources[step.panel ?? slide.code];
      for (const id of ['tab-name', 'crumb', 'code-file'])
        $(id).textContent = resource.file.split('/').at(-1);
      $('eyebrow').textContent = slide.label;
      renderTitle($('title'), slide.title);
      $('description').textContent = (step.description ?? slide.description).trim();
      $('takeaway-text').textContent = slide.takeaway;
      $('notes').textContent = slide.notes ?? '';
      $('author').hidden = !slide.author;
      renderPrinciples(root.querySelector('.principles'), slide.principles ?? []);
      $('counter').textContent = `${number(slideIndex + 1)} / ${number(deck.slides.length)}`;
      $('status-topic').textContent = `${number(slideIndex + 1)} — ${slide.name}`;
      $('step-status').textContent = `${stepIndex + 1}/${slide.steps.length} · ${step.label}`;
      $('previous').disabled = first;
      $('next').disabled = last;
      $('run').hidden = !slide.runnable;
      $('code-language').textContent = resource.language ?? '';
      revealContent(slide, stepIndex, root);
      updateNavigation(root, slideIndex);
      panels.show(resource.id, step);
      history.replaceState(null, '', `#${slideIndex + 1}`);
    },
    completed() {},
    error(error) {
      $('step-status').textContent = `Step failed: ${error.message}`;
    },
  };
}

function renderTitle(element, lines) {
  element.replaceChildren();
  for (const [index, line] of lines.entries()) {
    if (index) element.append(document.createElement('br'));
    if (line.text) element.append(document.createTextNode(line.text + (line.accent ? ' ' : '')));
    if (line.accent) {
      const accent = document.createElement('em');
      accent.textContent = line.accent;
      element.append(accent);
    }
  }
}

function renderPrinciples(element, principles) {
  element.hidden = !principles.length;
  element.replaceChildren(
    ...principles.map((text, index) => {
      const label = document.createElement('span');
      label.textContent = `${String(index + 1).padStart(2, '0')} `;
      const name = document.createElement('b');
      name.textContent = text;
      label.append(name);
      return label;
    }),
  );
}

function revealContent(slide, stepIndex, root) {
  const revealed = new Set(
    slide.steps.slice(0, stepIndex + 1).flatMap((step) => step.reveal ?? []),
  );
  const selectors = {
    description: '#description',
    author: '#author',
    principles: '.principles',
    takeaway: '.takeaway',
  };
  for (const [name, selector] of Object.entries(selectors)) {
    const element = root.querySelector(selector);
    element.classList.add('reveal');
    element.classList.toggle('revealed', revealed.has(name));
    element.setAttribute('aria-hidden', String(!revealed.has(name)));
  }
}

function populateNavigation(root, deck) {
  deck.slides.forEach((slide, index) => {
    const button = document.createElement('button');
    button.className = 'slide-link';
    button.dataset.slide = index;
    button.textContent = `${String(index + 1).padStart(2, '0')} ${slide.name}`;
    root.querySelector('nav').append(button);
  });
  for (const section of new Set(deck.slides.map((slide) => slide.label))) {
    const item = document.createElement('li');
    item.textContent = section;
    root.querySelector('.outline').append(item);
  }
}

function updateNavigation(root, index) {
  root.querySelectorAll('[data-slide]').forEach((element) => {
    const selected = Number(element.dataset.slide) === index;
    element.classList.toggle('selected', selected);
    element.setAttribute('aria-current', selected ? 'step' : 'false');
  });
}
