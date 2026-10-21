import { defineConfig, devices } from '@playwright/test';

/**
 * E2E — Actividad "Tests de su sistema con el agente: E2E con Playwright".
 * Levanta backend (:3001) y frontend (:5173, proxy /api -> :3001) reales — sin mocks de red.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev --prefix backend',
      port: 3001,
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'npm run dev --prefix frontend',
      port: 5173,
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
});
