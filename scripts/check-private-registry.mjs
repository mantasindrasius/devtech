import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { privateHost } from './registry-policy.mjs';

function git(args, allowed = [0]) {
  const result = spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error || !allowed.includes(result.status)) {
    throw new Error(result.error?.message || result.stderr.trim() || `git ${args[0]} failed`);
  }
  return result.stdout;
}
try {
  const commits = new Set();
  if (process.argv.includes('--pre-push')) {
    const remote = process.argv[process.argv.indexOf('--pre-push') + 1];
    for (const line of readFileSync(0, 'utf8').trim().split('\n').filter(Boolean)) {
      const [, localSha, , remoteSha] = line.split(/\s+/);
      if (!/^[a-f0-9]{40,64}$/.test(localSha ?? '') || !/^[a-f0-9]{40,64}$/.test(remoteSha ?? '')) throw new Error('Invalid pre-push ref input');
      if (/^0+$/.test(localSha)) continue; // Branch/tag deletion publishes no content.
      const args = ['rev-list', localSha];
      const knownRemote = !/^0+$/.test(remoteSha) && spawnSync('git', ['cat-file', '-e', `${remoteSha}^{commit}`]).status === 0;
      if (knownRemote) args.push(`^${remoteSha}`);
      else if (remote) args.push('--not', `--remotes=${remote}`);
      for (const sha of git(args).trim().split('\n').filter(Boolean)) commits.add(sha);
    }
  } else {
    commits.add('HEAD');
  }
  const violations = [];
  for (const commit of commits) {
    // Scan complete committed trees, including binary blobs, without printing contents.
    const matches = git(['grep', '-a', '-l', '-z', '-i', '-F', '-e', privateHost, commit, '--'], [0, 1]);
    violations.push(...matches.split('\0').filter(Boolean));
  }
  if (violations.length) {
    console.error('Push blocked: private registry references in committed files:\n' + violations.map(v => `  ${v}`).join('\n'));
    console.error('Run bun run registry:sanitize, then amend/rebase the affected outgoing commits. A later cleanup commit does not remove earlier occurrences.');
    process.exitCode = 1;
  } else {
    console.log(`Registry check passed (${commits.size} commit(s)).`);
  }
} catch (error) {
  console.error(`Registry check failed: ${error.message}`);
  process.exitCode = 1;
}
