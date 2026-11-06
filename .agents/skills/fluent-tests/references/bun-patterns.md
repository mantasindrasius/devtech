# Bun patterns

The driver names below are illustrative APIs, not existing project exports. Implement only helpers needed by the current behavior.

## Simple policy tests stay direct

```js
import { expect, test } from 'bun:test';
import { sanitizeRegistry, privateHost } from './registry-policy.mjs';

test('converts a scoped package URL to the public registry', () => {
  // Given
  const url = `https://${privateHost}/api/npm/npm-repos/@scope/pkg/-/pkg-1.0.0.tgz`;

  // When
  const sanitized = sanitizeRegistry(url);

  // Then
  expect(sanitized).toBe('https://registry.npmjs.org/@scope/pkg/-/pkg-1.0.0.tgz');
});
```

No driver is needed for a pure transformation. Assemble private hostnames through the policy helper rather than publishing literal fixtures.

## Fluent setup, explicit async actions

```js
// Illustrative driver contract; implement it before using this test.
test('replay restores saved code after a simulated edit', async () => {
  // Given
  const presentation = aPresentation()
    .withSavedCode('return total > 0;')
    .withTypingSuggestion('return total >= 0;');
  await presentation.mount();
  await presentation.finishTypingDemo();

  // When
  await presentation.replaySlide();

  // Then
  expect(presentation.visibleCode()).toBe('return total > 0;');
  expect(presentation.savedCode()).toBe('return total > 0;');
});
```

Register drivers for `afterEach` disposal. `finishTypingDemo()` advances an injected scheduler or awaits completion, not a guessed delay. The driver invokes production behavior; it does not implement replay itself.

## Git tests describe history

```js
// Illustrative driver contract; not an existing helper.
test('blocks a private reference even when a later commit removes it', async () => {
  // Given
  const repository = aRepository()
    .withRemoteBaseline()
    .withOutgoingPrivateRegistryReference()
    .withOutgoingCleanup();

  // When
  const result = await repository.checkPush();

  // Then
  expect(result.exitCode).toBe(1);
  expect(result.reportedFiles).toEqual(['bun.lock']);
});
```

This driver creates real temporary Git commits and invokes the actual checker. It owns refs/SHAs, subprocesses, parsing, and cleanup, and must reject setup failures. Write separate tests for deletion and clean pushes.

## Helper placement

Keep small feature-specific builders beside their tests. Extract shared drivers into a nearby `test-support` directory only when multiple tests need them. Name them by capability (`repository-driver`, `presentation-driver`), not `test-utils`. Reuse local drivers before adding another DSL.
