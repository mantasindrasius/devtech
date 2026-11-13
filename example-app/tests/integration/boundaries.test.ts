import { expect, test } from 'bun:test';
import { readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

test('workspace modules use declared public package entry points rather than reaching into internals', async () => {
  const root = resolve(import.meta.dir, '../../packages');
  const names = await readdir(root);
  const manifests = new Map(
    await Promise.all(
      names.map(async (name) => {
        const manifest = await Bun.file(resolve(root, name, 'package.json')).json();
        return [manifest.name, { ...manifest, root: resolve(root, name) }] as const;
      }),
    ),
  );
  const violations: string[] = [];
  for (const manifest of manifests.values()) {
    for await (const file of new Bun.Glob('src/**/*.ts').scan(manifest.root)) {
      const source = await Bun.file(resolve(manifest.root, file)).text();
      for (const [, specifier] of source.matchAll(/(?:from\s+|import\s*\()['"]([^'"]+)['"]/g)) {
        if (specifier.startsWith('.')) {
          const target = resolve(manifest.root, file, '..', specifier);
          if (relative(manifest.root, target).startsWith('..'))
            violations.push(`${manifest.name}: ${specifier}`);
        }
        if (!specifier.startsWith('@example/')) continue;
        const packageName = specifier.split('/').slice(0, 2).join('/');
        const subpath = specifier.slice(packageName.length);
        const target = manifests.get(packageName);
        if (
          !manifest.dependencies?.[packageName] ||
          !target?.exports[subpath ? `.${subpath}` : '.']
        )
          violations.push(`${manifest.name}: ${specifier}`);
      }
    }
  }
  expect(violations).toEqual([]);
});
