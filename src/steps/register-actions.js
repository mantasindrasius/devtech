import { Registry } from '../core/registry.js';
import { requireText } from '../content/validation.js';
import { createTypingStep } from './typing-step.js';

export function registerActions() {
  return new Registry('step action')
    .register('context-menu', {
      validate: (options) => requireText(options.target, 'context-menu.target'),
      create: (options, context) => ({
        run: ({ animate }) => (animate ? context.code.openContextMenu(options.target) : undefined),
        dispose: () => context.code.closeContextMenu(),
      }),
    })
    .register('type-edit', { validate: validateTyping, create: createTypingStep })
    .register('run-checks', {
      validate: (_, slide) => {
        if (!slide.runnable) throw new Error(`run-checks requires runnable: true on ${slide.id}`);
      },
      create: (_, context) => ({
        run: ({ signal, animate }) => (animate ? context.checks.run(signal) : undefined),
        dispose() {},
      }),
    });
}

function validateTyping(options) {
  requireText(options.find, 'type-edit.find');
  if (typeof options.replacement !== 'string')
    throw new Error('type-edit.replacement must be a string');
  if (/[\r\n]/.test(options.find + options.replacement))
    throw new Error('type-edit supports single-line expressions only');
  for (const key of ['typingDelayMs', 'holdMs']) {
    if (options[key] !== undefined && (!Number.isFinite(options[key]) || options[key] < 0))
      throw new Error(`Invalid ${key}`);
  }
  if (options.zoom !== undefined && typeof options.zoom !== 'boolean')
    throw new Error('type-edit.zoom must be boolean');
}
