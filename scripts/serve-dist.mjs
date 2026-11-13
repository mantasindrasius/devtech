import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const root = resolve(dist);

if (!(await Bun.file(resolve(root, 'index.html')).exists())) {
  console.error('No dist/index.html found. Run bun run build first.');
  process.exit(1);
}

const server = Bun.serve({
  hostname: process.env.HOST ?? '127.0.0.1',
  port: Number(process.env.PORT ?? 4173),
  async fetch(request) {
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url).pathname);
    } catch {
      return new Response('Bad request', { status: 400 });
    }

    const path = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!path.startsWith(`${root}${sep}`) || path.includes('\0')) {
      return new Response('Forbidden', { status: 403 });
    }

    const file = Bun.file(path);
    if (!(await file.exists())) return new Response('Not found', { status: 404 });
    return new Response(request.method === 'HEAD' ? null : file, {
      headers: { 'Content-Type': file.type, 'Cache-Control': 'no-cache' },
    });
  },
});

console.log(`Serving dist at ${server.url}`);
