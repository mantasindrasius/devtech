import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { privateHost, sanitizeRegistry } from './registry-policy.mjs';

test('sanitizes scoped tarball URLs without changing integrity or versions', () => {
  const before = JSON.stringify({ resolved: `https://${privateHost}/api/npm/npm-repos/@scope/pkg/-/pkg-1.0.0.tgz`, integrity: 'sha512-unchanged', version: '1.0.0' });
  const after = JSON.parse(sanitizeRegistry(before));
  assert.equal(after.resolved, 'https://registry.npmjs.org/@scope/pkg/-/pkg-1.0.0.tgz');
  assert.equal(after.integrity, 'sha512-unchanged');
  assert.equal(after.version, '1.0.0');
  assert.equal(sanitizeRegistry(after.resolved), after.resolved);
  assert.equal(sanitizeRegistry(`http://${privateHost.toUpperCase()}/pkg`), 'https://registry.npmjs.org/pkg');
});

test('checks outgoing history, allows deletions, and fails on invalid input', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'registry-hook-'));
  const checker = resolve('scripts/check-private-registry.mjs');
  const run = (cmd, args, options = {}) => spawnSync(cmd, args, { cwd, encoding: 'utf8', ...options });
  const git = (...args) => {
    const r = run('git', args); assert.equal(r.status, 0, r.stderr); return r.stdout.trim();
  };
  const commit = message => { git('add', '.'); git('-c', 'user.name=Hook Test', '-c', 'user.email=hook@example.invalid', 'commit', '-qm', message); return git('rev-parse', 'HEAD'); };
  const check = input => run(process.execPath, [checker, '--pre-push', 'origin'], { input });
  try {
    git('init', '-q');
    writeFileSync(join(cwd, 'lock.json'), '{}'); const clean = commit('clean');
    writeFileSync(join(cwd, 'lock.json'), `https://${privateHost}/pkg`); const bad = commit('bad');
    writeFileSync(join(cwd, 'lock.json'), '{}'); const fixed = commit('fixed');
    const zero = '0'.repeat(40);
    assert.equal(check(`refs/heads/main ${clean} refs/heads/main ${zero}\n`).status, 0);
    const blocked = check(`refs/heads/main ${fixed} refs/heads/main ${clean}\n`);
    assert.equal(blocked.status, 1); assert.match(blocked.stderr, /lock.json/);
    assert.equal(check(`refs/heads/main ${fixed} refs/heads/main ${bad}\n`).status, 0);
    assert.equal(check(`(delete) ${zero} refs/heads/main ${bad}\n`).status, 0);
    assert.equal(check('invalid input\n').status, 1);
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
