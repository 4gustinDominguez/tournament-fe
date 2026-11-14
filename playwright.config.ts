import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: "http://localhost:3003",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // The e2e suite boots its own local stack on dedicated ports (3002/3003),
  // isolated from whatever runs on 3000/3001 (dev or Docker) and without Postgres
  // (file storage). Anything already listening on 3002/3003 is reused.
  webServer: [
    {
      command: "PORT=3002 pnpm --dir ../t-form-api dev",
      port: 3002,
      reuseExistingServer: !isCI,
    },
    {
      command: "NEXT_PUBLIC_API_URL=http://localhost:3002 pnpm exec next dev -p 3003",
      url: "http://localhost:3003",
      reuseExistingServer: !isCI,
    },
  ],

  projects: [
    {
      name: "desktop-chromium",
      use: { ...devices["Desktop Chrome"], locale: "es-ES" },
    },
  ],
});
