import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, lstatSync } from 'node:fs';
import { sanitizeRegistry } from './registry-policy.mjs';

// Default to tracked working-tree files; explicit paths also support new files.
const files = process.argv.slice(2);
if (!files.length) files.push(...execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean));
let changed = 0;
for (const file of files) {
  let stat;
  try { stat = lstatSync(file); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  if (!stat.isFile()) continue;
  const bytes = readFileSync(file);
  if (bytes.includes(0)) continue;
  const text = bytes.toString('utf8');
  if (!Buffer.from(text).equals(bytes)) continue;
  const updated = sanitizeRegistry(text);
  if (updated !== text) { writeFileSync(file, updated); console.log(`Sanitized ${file}`); changed++; }
}
console.log(`Sanitized ${changed} file(s). Review and commit the changes before pushing.`);
