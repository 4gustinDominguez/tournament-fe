import { test as base, Page } from "@playwright/test";

interface MonitoredIssues {
  pageErrors: string[];
  httpErrors: string[];
  consoleErrors: string[];
}

export function monitorPage(page: Page): MonitoredIssues {
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

export function assertNoErrors(issues: MonitoredIssues): void {
  expect(issues.pageErrors, issues.pageErrors.join("\n")).toEqual([]);
  expect(issues.httpErrors, issues.httpErrors.join("\n")).toEqual([]);
}

type Fixtures = {
  monitor: (page: Page) => MonitoredIssues;
};

export const test = base.extend<Fixtures>({
  monitor: async ({ page }, consume) => {
    const issues = monitorPage(page);
    await consume(issues);
  },
});

export { expect } from "@playwright/test";
