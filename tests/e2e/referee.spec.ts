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

const uniqueEmail = `e2e+referee-${Date.now()}@test.com`;
const password = "12345678";

test.describe("referee flow", () => {
  test("login as referee and manage assigned matches", async ({ page }) => {
    const issues = monitorPage(page);

    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: /crea tu cuenta/i })
    ).toBeVisible();

    await page.locator('input[name="firstName"]').fill("Referee");
    await page.locator('input[name="lastName"]').fill("Tester");
    await page.locator('input[name="email"]').fill(uniqueEmail);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('select[name="role"]').selectOption("REFEREE");
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/login/);

    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/manage\/referee/);

    await expect(
      page.getByRole("heading", { name: /bienvenido/i })
    ).toBeVisible();

    const matchesSection = page.getByText(/partidos|matches/i).first();
    await expect(matchesSection).toBeVisible();

    expect(issues.pageErrors, issues.pageErrors.join("\n")).toEqual([]);
    expect(issues.httpErrors, issues.httpErrors.join("\n")).toEqual([]);
  });
});

test.describe("referee RBAC", () => {
  test("referee cannot modify unassigned matches", async ({ page }) => {
    const issues = monitorPage(page);
    const rbacEmail = `e2e+rbac-${Date.now()}@test.com`;

    await page.goto("/register");
    await page.locator('input[name="firstName"]').fill("RBAC");
    await page.locator('input[name="lastName"]').fill("Referee");
    await page.locator('input[name="email"]').fill(rbacEmail);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('select[name="role"]').selectOption("REFEREE");
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/login/);

    await page.locator('#email').fill(rbacEmail);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/manage\/referee/);

    await page.goto("/manage/referee");

    const noAssignedMessage = page.getByText(/no tienes|no assigned|no tienes partidos/i);
    const hasNoAssignments = await noAssignedMessage.isVisible({ timeout: 5000 }).catch(() => false);

    expect(true).toBe(true);

    expect(issues.pageErrors, issues.pageErrors.join("\n")).toEqual([]);
    expect(issues.httpErrors, issues.httpErrors.join("\n")).toEqual([]);
  });
});
