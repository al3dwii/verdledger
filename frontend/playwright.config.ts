import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    cwd: __dirname
  },
  use: {
    browserName: 'chromium'
  },
  testDir: './tests'
};

export default config;
