import { expect, test } from 'bun:test';
import { patrolModules, showAgentAtWork } from '../src/renderers/agent-patrol-player.js';

const call = (tool, target) => ({ tool, target });

/** Records what an agent is told to do, stamped with the virtual time it happened at. */
function anAgent(...stops) {
  const clock = { nowMs: 0 };
  const did = [];
  const record = (event) => did.push(`${clock.nowMs}ms ${event}`);
  const agent = {
    clock,
    did,
    stops,
    contextRate: 1,
    tokens: undefined,
    fillingContext(rate) {
      agent.contextRate = rate;
      return agent;
    },
    showContext({ tokens }) {
      if (agent.compacting) record(`compacted to ${tokens}`);
      agent.compacting = false;
      agent.tokens = Math.round(tokens);
    },
    showCompaction(progress) {
      if (!agent.compacting) record('compacting');
      agent.compacting = true;
      agent.compactionProgress = progress;
    },
    placeAt: (stop) => record(`at ${stop.name}`),
    travelTo: (stop) => record(`hop to ${stop.name}`),
    arriveAt: (stop) => record(`reading ${stop.name}`),
    leave: (stop) => record(`done with ${stop.name}`),
    call: ({ tool, target }) => record(`${tool} ${target}`),
    quiet: () => record('quiet'),
  };
  return agent;
}

/** Advances virtual time instantly and stops the patrol once `untilMs` has passed. */
function aVirtualClock(agent, { untilMs }) {
  const patrol = new AbortController();
  return {
    signal: patrol.signal,
    async wait(ms, signal) {
      signal.throwIfAborted();
      agent.clock.nowMs += ms;
      if (agent.clock.nowMs >= untilMs) patrol.abort(new Error('stopped'));
      signal.throwIfAborted();
    },
  };
}

const billing = { name: 'billing', calls: [call('Grep', 'discount'), call('Read', 'policy.ts')] };
const orders = { name: 'orders', calls: [call('Bash', 'bun test')] };

test('lingers at a module for its tool calls and hops quickly to the next', async () => {
  const agent = anAgent(billing, orders);

  await patrolModules(agent, aVirtualClock(agent, { untilMs: 4000 }));

  expect(agent.did).toEqual([
    '0ms at billing',
    '0ms reading billing',
    '0ms Grep discount',
    '600ms quiet',
    '760ms Read policy.ts',
    '1560ms quiet',
    '1720ms done with billing',
    '1720ms hop to orders',
    '2200ms reading orders',
    '2200ms Bash bun test',
    '3900ms quiet',
  ]);
});

test('returns to the first module after the last', async () => {
  const agent = anAgent(billing, orders);

  await patrolModules(agent, aVirtualClock(agent, { untilMs: 4500 }));

  expect(agent.did.slice(-2)).toEqual(['4060ms done with orders', '4060ms hop to billing']);
});

test('does nothing further once the patrol is stopped mid-call', async () => {
  const agent = anAgent(billing, orders);

  await patrolModules(agent, aVirtualClock(agent, { untilMs: 500 }));

  expect(agent.did.at(-1)).toBe('0ms Grep discount');
});

test('fills the context three times faster where the design scatters what must be read', async () => {
  const focused = anAgent(billing, orders);
  const scattered = anAgent(billing, orders).fillingContext(3);

  await patrolModules(focused, aVirtualClock(focused, { untilMs: 1700 }));
  await patrolModules(scattered, aVirtualClock(scattered, { untilMs: 1700 }));

  expect(focused.tokens).toBe(10_000 + 12_000 + 45_000);
  expect(scattered.tokens).toBe(10_000 + 3 * (12_000 + 45_000));
});

test('stops to compact a full context before doing anything else', async () => {
  const reading = { name: 'core', calls: [call('Read', 'core.ts')] };
  const agent = anAgent(reading).fillingContext(8);

  await patrolModules(agent, aVirtualClock(agent, { untilMs: 7000 }));

  const fromThirdRead = agent.did.slice(agent.did.indexOf('2880ms Read core.ts'));
  expect(fromThirdRead.slice(0, 5)).toEqual([
    '2880ms Read core.ts',
    '3680ms quiet',
    '3840ms compacting',
    '6840ms compacted to 50000',
    '6840ms done with core',
  ]);
});

test('shows the agent making a call at its first module when motion is reduced', () => {
  const agent = anAgent(billing, orders);

  showAgentAtWork(agent);

  expect(agent.did).toEqual(['0ms at billing', '0ms reading billing', '0ms Grep discount']);
});
