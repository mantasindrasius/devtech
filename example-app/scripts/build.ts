import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const exampleRoot = fileURLToPath(new URL('..', import.meta.url));
export async function buildClient() {
  const outdir = join(exampleRoot, 'dist/assets');
  await mkdir(outdir, { recursive: true });
  const result = await Bun.build({
    entrypoints: [join(exampleRoot, 'apps/web/src/main.tsx')],
    outdir,
    target: 'browser',
    minify: true,
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  if (!result.success) throw new AggregateError(result.logs, 'Client build failed');
  await Bun.write(
    join(exampleRoot, 'dist/index.html'),
    Bun.file(join(exampleRoot, 'apps/web/index.html')),
  );
  console.log('Built example-app/dist (independent of the presentation).');
}
if (import.meta.main) await buildClient();
