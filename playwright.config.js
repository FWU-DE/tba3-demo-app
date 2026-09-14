import { defineConfig, devices } from '@playwright/test';

// Getestet wird gegen den ausgelieferten Stand, nicht gegen den Dev-Server:
// `npm run preview` liefert dist/ so aus, wie Vercel und nginx es tun — samt
// Base-Pfaden, Rewrites und eigenem Mock. Ein Fehler, der nur im Deployment
// auftritt, fiele gegen den Dev-Server nicht auf.
//
// Gegen einen schon laufenden Server testen (spart den Build):
//   E2E_BASE_URL=http://localhost:4173 npx playwright test
const basisUrl = process.env.E2E_BASE_URL ?? 'http://localhost:4173';

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.ergebnisse',
  fullyParallel: true,

  // Ein `test.only`, das versehentlich eingecheckt wird, ließe die CI grün
  // werden, ohne die übrigen Tests auszuführen.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'e2e/.bericht' }]]
    : [['list']],

  use: {
    baseURL: basisUrl,
    locale: 'de-DE',
    // Nur im Fehlerfall — sonst füllt sich das Verzeichnis mit Spuren
    // erfolgreicher Läufe.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 960 } },
    },
  ],

  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run build && npm run preview',
        url: basisUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: 'ignore',
        stderr: 'pipe',
      },
});
