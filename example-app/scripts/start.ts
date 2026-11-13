import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { buildClient, exampleRoot } from './build';
import { startServer } from '../apps/server/src/server';
import { openBrowser } from './open-browser';

if (!process.argv.includes('--skip-build')) await buildClient();
const databasePath = process.env.DATABASE_PATH ?? join(exampleRoot, '.data/shop.sqlite');
if (databasePath !== ':memory:') await mkdir(dirname(databasePath), { recursive: true });
const port = Number(process.env.PORT ?? 4174);
if (!Number.isInteger(port) || port < 0 || port > 65535)
  throw new Error('PORT must be from 0 to 65535.');
const app = startServer({ databasePath, port, assetsPath: join(exampleRoot, 'dist') });
console.log(`Field Supply is ready at ${app.url}`);

for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.once(signal, async () => {
    await app.stop();
    process.exit(0);
  });

if (process.argv.includes('--open') && !process.argv.includes('--no-open')) {
  await openBrowser(app.url);
}
