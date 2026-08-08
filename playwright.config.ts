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

  // E2E levanta su propio stack local en puertos dedicados (3002/3003),
  // aislado de lo que corra en 3000/3001 (dev o Docker) y sin Postgres
  // (file storage). Si ya hay algo escuchando en 3002/3003 se reutiliza.
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
