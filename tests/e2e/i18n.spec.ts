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

test.describe("i18n sanity", () => {
  test("english locale /en/ renders in English", async ({ page }) => {
    const issues = monitorPage(page);

    await page.goto("/en/login");

    const heading = page.getByRole("heading", { name: /sign in|login/i });
    await expect(heading.first()).toBeVisible({ timeout: 10000 });

    const langAttr = await page.locator("html").getAttribute("lang");
    expect(langAttr).toBe("en");

    expect(issues.pageErrors, issues.pageErrors.join("\n")).toEqual([]);
    expect(issues.httpErrors, issues.httpErrors.join("\n")).toEqual([]);
  });

  test("spanish locale default renders in Spanish", async ({ page }) => {
    const issues = monitorPage(page);

    await page.goto("/login");

    const heading = page.getByRole("heading", { name: /ingresa a tu cuenta/i });
    await expect(heading.first()).toBeVisible({ timeout: 10000 });

    const langAttr = await page.locator("html").getAttribute("lang");
    expect(langAttr).toBe("es");

    expect(issues.pageErrors, issues.pageErrors.join("\n")).toEqual([]);
    expect(issues.httpErrors, issues.httpErrors.join("\n")).toEqual([]);
  });

  test("language switcher changes locale", async ({ page }) => {
    const issues = monitorPage(page);

    await page.goto("/en/login");
    await expect(page.getByRole("heading", { name: /sign in|login/i }).first()).toBeVisible({ timeout: 10000 });

    const langSwitch = page.getByRole("link", { name: /es|español/i }).or(page.getByRole("button", { name: /es|español/i }));
    if (await langSwitch.isVisible({ timeout: 2000 })) {
      await langSwitch.first().click();
      await page.waitForTimeout(1000);
      await expect(page.getByRole("heading", { name: /inicia sesión/i }).first()).toBeVisible({ timeout: 5000 });
    }

    expect(issues.pageErrors, issues.pageErrors.join("\n")).toEqual([]);
    expect(issues.httpErrors, issues.httpErrors.join("\n")).toEqual([]);
  });
});
