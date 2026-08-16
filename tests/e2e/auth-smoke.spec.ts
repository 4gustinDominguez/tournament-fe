import { test, expect, Page } from "@playwright/test";

interface MonitoredIssues {
  pageErrors: string[];
  httpErrors: string[];
  consoleErrors: string[];
}

function monitorPage(page: Page): MonitoredIssues {
  const issues: MonitoredIssues = {
    pageErrors: [],
    httpErrors: [],
    consoleErrors: [],
  };

  page.on("pageerror", (error) => {
    issues.pageErrors.push(`pageerror: ${error.message}`);
  });

  page.on("response", (response) => {
    if (response.status() >= 500) {
      issues.httpErrors.push(`HTTP ${response.status()} ${response.url()}`);
    }
  });

  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.consoleErrors.push(`console.error: ${message.text()}`);
    }
  });

  return issues;
}

const uniqueEmail = `e2e+${Date.now()}@test.com`;
const password = "12345678";

test.describe("auth smoke", () => {
  test("register, login and render the admin dashboard", async ({ page }) => {
    const issues = monitorPage(page);

    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: /crea tu cuenta/i })
    ).toBeVisible();

    await page.locator('input[name="firstName"]').fill("E2E");
    await page.locator('input[name="lastName"]').fill("Tester");
    await page.locator('input[name="email"]').fill(uniqueEmail);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('select[name="role"]').selectOption("TOURNAMENT_ADMIN");
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/login/);

    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/manage\/my-tournaments/);

    await expect(
      page.getByRole("heading", { name: "Mis Torneos" })
    ).toBeVisible();
    await expect(page.getByText("Total Equipos")).toBeVisible();
    await expect(page.getByText("Total Jugadores")).toBeVisible();
    await expect(page.getByText("Total Partidos")).toBeVisible();

    expect(issues.pageErrors, issues.pageErrors.join("\n")).toEqual([]);
    expect(issues.httpErrors, issues.httpErrors.join("\n")).toEqual([]);
  });
});
