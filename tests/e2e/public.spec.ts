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

test.describe("public landing page", () => {
  test("landing page /t/[id] renders without login", async ({ page }) => {
    const issues = monitorPage(page);

    await page.goto("/t/non-existent-id");
    const notFound = page.getByText(/no encontrado|tournament not found/i);
    await expect(notFound.first()).toBeVisible({ timeout: 10000 });

    expect(issues.pageErrors, issues.pageErrors.join("\n")).toEqual([]);
    expect(issues.httpErrors.filter(e => !e.includes('favicon')), issues.httpErrors.join("\n")).toEqual([]);
  });

  test("landing page shows tournament data when accessed via admin", async ({ page }) => {
    const issues = monitorPage(page);
    const uniqueEmail = `e2e+public-${Date.now()}@test.com`;
    const password = "12345678";

    await page.goto("/register");
    await page.locator('input[name="firstName"]').fill("Public");
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

    await page.goto("/manage/my-tournaments");
    await page.getByRole("button", { name: /quick setup|configuración rápida/i }).click();

    await page.waitForURL(/\/manage\/setup-wizard/);

    await page.getByRole("button", { name: /quick.*random|rápido.*aleatorio/i }).click();

    const tournamentName = `Public Tournament ${Date.now()}`;
    await page.locator('input[name="tournamentName"]').fill(tournamentName);

    await page.getByRole("button", { name: "Siguiente" }).click();

    await page.getByRole("button", { name: "Siguiente" }).click();

    await page.getByRole("button", { name: /generar|generate/i }).click();

    await page.waitForURL(/\/t\/.+/);
    const currentUrl = page.url();
    const tournamentId = currentUrl.split("/t/")[1];

    const newPage = await page.context().newPage();
    const newIssues = monitorPage(newPage);

    await newPage.goto(`/t/${tournamentId}`);
    await expect(newPage.getByText(tournamentName).first()).toBeVisible({ timeout: 15000 });

    const standings = newPage.getByRole("heading", { name: /clasificación|standings/i });
    await expect(standings).toBeVisible();

    const matches = newPage.getByRole("heading", { name: /partidos|matches/i });
    await expect(matches).toBeVisible();

    const teams = newPage.getByRole("heading", { name: /equipos|teams/i });
    await expect(teams).toBeVisible();

    const dashboardLink = newPage.locator('a[href*="/manage/my-tournaments"]');
    const hasDashboardLink = await dashboardLink.count() > 0;
    expect(hasDashboardLink).toBe(true);

    const adminActionButtons = newPage.locator('button[aria-label="delete"], button[aria-label="edit"]');
    const hasAdminActions = await adminActionButtons.count() > 0;
    expect(hasAdminActions).toBe(false);

    expect(newIssues.pageErrors, newIssues.pageErrors.join("\n")).toEqual([]);
    expect(newIssues.httpErrors.filter(e => !e.includes('favicon')), newIssues.httpErrors.join("\n")).toEqual([]);

    await newPage.close();
    expect(issues.pageErrors, issues.pageErrors.join("\n")).toEqual([]);
    expect(issues.httpErrors, issues.httpErrors.join("\n")).toEqual([]);
  });
});
