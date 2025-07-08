import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  testMatch: ['web/tests/**/*.ts', 'site/tests/**/*.ts'],
  retries: 0,
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
