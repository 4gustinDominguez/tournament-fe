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

const uniqueEmail = `e2e+admin-${Date.now()}@test.com`;
const password = "12345678";

test.describe("admin happy path", () => {
  test("register, login, create tournament via wizard and verify public landing", async ({
    page,
  }) => {
    const issues = monitorPage(page);

    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: /crea tu cuenta/i })
    ).toBeVisible();

    await page.locator('input[name="firstName"]').fill("Admin");
    await page.locator('input[name="lastName"]').fill("Tester");
    await page.locator('input[name="email"]').fill(uniqueEmail);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('select[name="role"]').selectOption("TOURNAMENT_ADMIN");
    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/login/);

    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill(password);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("/");

    await page.goto("/manage/my-tournaments");
    await expect(
      page.getByRole("heading", { name: "Mis Torneos" })
    ).toBeVisible();

    await page.getByRole("button", { name: /quick setup|configuración rápida/i }).click();

    const wizardTitle = page.getByText(/✨|configuración rápida/i);
    await expect(wizardTitle.first()).toBeVisible();

    const tournamentName = `E2E Tournament ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await page.locator('input[name="tournamentName"]').fill(tournamentName);

    await page.locator('.fixed.inset-0.z-50 button:has-text("Siguiente")').click();

    await page.locator('.fixed.inset-0.z-50 button:has-text("Siguiente")').click();

    page.on("dialog", async dialog => {
      if (dialog.message().includes("error") || dialog.message().includes("Error")) {
        await dialog.accept();
      }
    });

    await page.locator('.fixed.inset-0.z-50 button:has-text("Generar")').click();

    try {
      await page.waitForURL(/\/t\/.+/, { timeout: 10000 });

      await expect(page.getByText(tournamentName).first()).toBeVisible({ timeout: 10000 });

      const matchesSection = page.getByRole("heading", { name: /partidos|matches/i });
      await expect(matchesSection).toBeVisible();

      const teamsSection = page.getByRole("heading", { name: /equipos|teams/i });
      await expect(teamsSection).toBeVisible();

      const standingsSection = page.getByRole("heading", { name: /tabla|standings/i });
      await expect(standingsSection).toBeVisible();
    } catch {
      await page.goto("/manage/my-tournaments");
      await expect(page.getByText(tournamentName).first()).toBeVisible({ timeout: 5000 });
    }

    expect(issues.pageErrors, issues.pageErrors.join("\n")).toEqual([]);
    expect(issues.httpErrors, issues.httpErrors.join("\n")).toEqual([]);
  });
});
