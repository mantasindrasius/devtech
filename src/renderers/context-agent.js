const bubbleHeightPx = 44;
const bubbleGapAbovePx = 70;
const bubbleGapBelowPx = 38;
const bubblePaddingPx = 16;
const bubbleCharacterPx = 12.7;
const shellInsetPx = 8;
const nearlyFullShare = 0.8;

/**
 * Adapts a `.context-agent` element to the agent the patrol player drives. Its
 * `.agent-stop` children name the modules it visits and the tool calls it makes there.
 * CSS turns position changes, `data-pace`, `data-context` and the bubble's `data-calling`
 * into motion.
 */
export function contextAgent(element) {
  const layer = element.closest('[data-appears-at]');
  const shell = boxOf(layer.querySelector('.context-shell'));
  const stops = [...element.querySelectorAll('.agent-stop')].map((stop) => readStop(stop, layer));
  if (stops.length === 0) throw new Error('Context agent needs at least one agent-stop');
  const bubble = bubbleOf(element, layer);
  const meter = meterOf(element);
  let position = stops[0];

  function moveTo(stop, pace) {
    position = stop;
    element.dataset.pace = pace;
    element.style.transform = `translate(${stop.x}px, ${stop.y}px)`;
  }

  return {
    stops,
    contextRate: readContextRate(element),
    startingTokens: readStartingTokens(element),
    showContext: (context) => meter.showContext(context),
    showCompaction: (progress) => meter.showCompaction(progress),
    placeAt: (stop) => moveTo(stop, 'placed'),
    travelTo: (stop) => moveTo(stop, 'travelling'),
    arriveAt: (stop) => countReaders(stop.module, +1),
    leave: (stop) => countReaders(stop.module, -1),
    call(call) {
      bubble.show(call, bubblePlacement(call, position, shell));
    },
    quiet: () => bubble.hide(),
    reset() {
      bubble.hide();
      meter.clear();
      for (const stop of stops) stop.module.dataset.readers = '0';
    },
  };
}

function boxOf(rect) {
  const [x, y, width, height] = ['x', 'y', 'width', 'height'].map((name) =>
    Number(rect.getAttribute(name)),
  );
  return { x, y, width, height };
}

function readStop(stop, layer) {
  const module = layer.querySelector(`#${stop.dataset.module}`);
  if (!module) throw new Error(`Agent stop names an unknown module: ${stop.dataset.module}`);
  const calls = (stop.dataset.calls ?? '').split('|').filter(Boolean).map(readCall);
  if (calls.length === 0) throw new Error(`Agent stop needs data-calls: ${stop.dataset.module}`);
  const box = boxOf(module);
  return {
    module,
    calls,
    bubbleBelow: stop.dataset.bubble === 'below',
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
}

/** "Read billing/policy.ts" → the tool and what it is pointed at. */
function readCall(text) {
  const [tool, ...target] = text.trim().split(' ');
  return { tool, target: target.join(' ') };
}

function countReaders(module, change) {
  module.dataset.readers = String(Math.max(0, Number(module.dataset.readers ?? 0) + change));
}

/** Centres the bubble over the agent but keeps it inside the design's shell. */
function bubblePlacement(call, stop, shell) {
  const width = bubbleWidth(call);
  const leftmost = shell.x + shellInsetPx;
  const rightmost = shell.x + shell.width - shellInsetPx - width;
  const left = Math.min(Math.max(stop.x - width / 2, leftmost), rightmost);
  const top = stop.bubbleBelow ? bubbleGapBelowPx : -bubbleGapAbovePx - bubbleHeightPx;
  return { x: left, y: stop.y + top, width };
}

function bubbleWidth({ tool, target }) {
  return Math.round((tool.length + 1 + target.length) * bubbleCharacterPx + 2 * bubblePaddingPx);
}

/** Bubbles move to the top of the layer so no other agent's marker can cover them. */
function bubbleOf(element, layer) {
  const group = element.querySelector('.agent-bubble');
  layer.append(group);
  const box = group.querySelector('.agent-bubble-box');
  const text = group.querySelector('.agent-bubble-text');
  const tool = group.querySelector('.agent-bubble-tool');
  const target = group.querySelector('.agent-bubble-target');
  return {
    show(call, { x, y, width }) {
      group.setAttribute('transform', `translate(${x} ${y})`);
      box.setAttribute('width', String(width));
      text.setAttribute('x', String(bubblePaddingPx));
      tool.textContent = call.tool;
      target.textContent = ` ${call.target}`;
      group.dataset.calling = 'true';
    },
    hide() {
      group.dataset.calling = 'false';
    },
  };
}

function readContextRate(element) {
  const rate = Number(element.dataset.contextRate ?? 1);
  if (!(rate > 0)) throw new Error(`Context agent needs a positive data-context-rate: ${rate}`);
  return rate;
}

function readStartingTokens(element) {
  if (element.dataset.contextStart === undefined) return undefined;
  const tokens = Number(element.dataset.contextStart);
  if (!(tokens >= 0)) throw new Error(`Context agent has an invalid data-context-start: ${tokens}`);
  return tokens;
}

/** 128400 → "128K"; a full window reads "1M". */
export function formatTokens(tokens) {
  return tokens >= 1_000_000
    ? `${Math.round(tokens / 100_000) / 10}M`
    : `${Math.round(tokens / 1000)}K`;
}

/** The token count above the agent and a gauge of how full its context window is. */
function meterOf(element) {
  const count = element.querySelector('.agent-tokens');
  const fill = element.querySelector('.agent-meter-fill');
  const fullWidth = Number(element.querySelector('.agent-meter-track').getAttribute('width'));
  const fillTo = (share) => fill.setAttribute('width', String(Math.round(fullWidth * share)));
  return {
    showContext({ tokens, limit }) {
      count.textContent = formatTokens(tokens);
      fillTo(tokens / limit);
      element.dataset.context = tokens / limit >= nearlyFullShare ? 'nearly-full' : 'roomy';
    },
    showCompaction(progress) {
      count.textContent = `compacting ${Math.round(progress * 100)}%`;
      fillTo(1 - progress);
      element.dataset.context = 'compacting';
    },
    clear() {
      count.textContent = '';
      fillTo(0);
      delete element.dataset.context;
    },
  };
}
