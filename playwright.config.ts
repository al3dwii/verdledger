import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './frontend/tests',
  retries: 0,
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
