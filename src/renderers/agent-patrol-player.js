const travelMs = 480;
const betweenCallsMs = 160;
const tickMs = 100;
const compactionMs = 3000;

const contextLimit = 1_000_000;
const freshContext = 10_000;
const compactedContext = 50_000;

/** How long an illustrative call of each tool takes and how much context its result adds. */
const tools = {
  Grep: { runMs: 600, tokens: 12_000 },
  Read: { runMs: 800, tokens: 45_000 },
  Edit: { runMs: 1000, tokens: 8_000 },
  Write: { runMs: 1000, tokens: 10_000 },
  Bash: { runMs: 1700, tokens: 30_000 },
};
const unknownTool = { runMs: 800, tokens: 20_000 };

/**
 * Moves an agent the way it works: it stays at a module while it makes tool calls
 * there, then hops quickly to the next one. Every call fills its context window,
 * `agent.contextRate` times faster in a design that scatters what it must read; a full
 * window stops the agent until it has compacted. An agent may begin with
 * `agent.startingTokens` already in its window. Repeats until `signal` aborts; nothing
 * is updated after that.
 */
export async function patrolModules(agent, { wait, signal }) {
  const context = { tokens: agent.startingTokens ?? freshContext };
  try {
    agent.placeAt(agent.stops[0]);
    agent.showContext({ tokens: context.tokens, limit: contextLimit });
    for (;;) {
      for (const [index, stop] of agent.stops.entries()) {
        await workAt(agent, stop, context, { wait, signal });
        agent.travelTo(agent.stops[(index + 1) % agent.stops.length]);
        await wait(travelMs, signal);
      }
    }
  } catch (error) {
    if (!signal.aborted) throw error;
  }
}

async function workAt(agent, stop, context, { wait, signal }) {
  agent.arriveAt(stop);
  for (const call of stop.calls) {
    await makeCall(agent, call, context, { wait, signal });
    if (context.tokens >= contextLimit) await compact(agent, context, { wait, signal });
  }
  agent.leave(stop);
}

/** The call's result streams into the context while the call is shown. */
async function makeCall(agent, call, context, { wait, signal }) {
  const { runMs, tokens } = tools[call.tool] ?? unknownTool;
  const ticks = Math.round(runMs / tickMs);
  const tokensPerTick = (tokens * agent.contextRate) / ticks;
  agent.call(call);
  for (let tick = 0; tick < ticks; tick++) {
    await wait(tickMs, signal);
    context.tokens = Math.min(contextLimit, context.tokens + tokensPerTick);
    agent.showContext({ tokens: context.tokens, limit: contextLimit });
  }
  agent.quiet();
  await wait(betweenCallsMs, signal);
}

/** The agent can do nothing else until its full context is summarised. */
async function compact(agent, context, { wait, signal }) {
  const ticks = compactionMs / tickMs;
  for (let tick = 0; tick < ticks; tick++) {
    agent.showCompaction(tick / ticks);
    await wait(tickMs, signal);
  }
  context.tokens = compactedContext;
  agent.showContext({ tokens: context.tokens, limit: contextLimit });
}

/** The reduced-motion alternative: the agent at its first module, mid tool call. */
export function showAgentAtWork(agent) {
  const [first] = agent.stops;
  agent.placeAt(first);
  agent.showContext({ tokens: agent.startingTokens ?? freshContext, limit: contextLimit });
  agent.arriveAt(first);
  agent.call(first.calls[0]);
}
