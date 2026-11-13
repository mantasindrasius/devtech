import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.E2E_PORT ?? 4186);
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: { baseURL: `http://127.0.0.1:${port}`, browserName: 'chromium', trace: 'retain-on-failure' },
  reporter: 'list',
  outputDir: '../../test-results',
  webServer: {
    cwd: fileURLToPath(new URL('../..', import.meta.url)),
    command: 'bun scripts/start.ts --no-open --skip-build',
    url: `http://127.0.0.1:${port}/api/health`,
    timeout: 30_000,
    reuseExistingServer: false,
    env: { PORT: String(port), DATABASE_PATH: ':memory:' },
  },
});
