import { defineConfig, devices } from '@playwright/test';

const port = 4350;

// Browser behaviour checks against the production build. On Windows the
// hardware GPU is used through ANGLE/D3D11. Elsewhere (for example Linux CI)
// Chromium falls back to SwiftShader software WebGL, measured locally at about
// 1.3 s per frame; the entrance then slows rather than skips, hence long timeouts.
export default defineConfig({
  testDir: 'tests/browser',
  outputDir: 'artifacts/playwright/results',
  timeout: 240_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: `http://127.0.0.1:${port}/`,
    viewport: { width: 1024, height: 640 },
    launchOptions: { args: process.platform === 'win32' ? ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] : [] },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run build && npm run preview -- --port ${port}`,
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
