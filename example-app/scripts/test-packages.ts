import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const script = process.argv[2];
if (!['test:unit', 'test:integration'].includes(script))
  throw new Error('Choose a module test layer.');
const packages = new URL('../packages/', import.meta.url);
const runs = [];
for (const name of (await readdir(packages)).sort()) {
  const directory = fileURLToPath(new URL(`${name}/`, packages));
  const manifest = await Bun.file(join(directory, 'package.json')).json();
  if (!manifest.scripts?.[script]) continue;
  console.log(`${manifest.name}: ${script}`);
  runs.push(
    Bun.spawn(['bun', 'run', '--cwd', directory, script], {
      stdout: 'inherit',
      stderr: 'inherit',
    }).exited,
  );
}
if (!runs.length) throw new Error(`No packages implement ${script}.`);
const results = await Promise.all(runs);
if (results.some((code) => code !== 0)) process.exitCode = 1;
