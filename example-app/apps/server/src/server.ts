import { composeServer } from '@example/composition/server';
import { openShopStore } from '@example/sqlite-store';
import { createShopHandler } from '@example/http-server';
import { join } from 'node:path';

export function startServer({
  databasePath,
  assetsPath,
  port = 4174,
}: {
  databasePath: string;
  assetsPath: string;
  port?: number;
}) {
  const store = openShopStore(databasePath);
  try {
    const handleApi = createShopHandler(composeServer(store));
    const server = Bun.serve({
      hostname: '127.0.0.1',
      port,
      maxRequestBodySize: 64 * 1024,
      async fetch(request) {
        const path = new URL(request.url).pathname;
        if (path.startsWith('/api/')) return handleApi(request);
        if (request.method !== 'GET' && request.method !== 'HEAD')
          return new Response('Method not allowed', { status: 405 });
        const relative =
          path === '/'
            ? 'index.html'
            : /^\/assets\/[\w.-]+$/.test(path)
              ? path.slice(1)
              : undefined;
        if (!relative) return new Response('Not found', { status: 404 });
        const file = Bun.file(join(assetsPath, relative));
        if (!(await file.exists())) return new Response('Not found', { status: 404 });
        return new Response(file, { headers: { 'X-Content-Type-Options': 'nosniff' } });
      },
    });
    let stopped = false;
    return {
      url: server.url.toString(),
      async stop() {
        if (stopped) return;
        stopped = true;
        await server.stop(false);
        store.close();
      },
    };
  } catch (error) {
    store.close();
    throw error;
  }
}
