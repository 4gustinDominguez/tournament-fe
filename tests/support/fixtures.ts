import { test as base, Page, expect } from "@playwright/test";

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
  const formatIssues = (arr: string[]) =>
    arr.length > 0 ? arr.join("\n") : "no errors";

  expect(issues.pageErrors, formatIssues(issues.pageErrors)).toEqual([]);
  expect(issues.httpErrors, formatIssues(issues.httpErrors)).toEqual([]);
  expect(issues.consoleErrors, formatIssues(issues.consoleErrors)).toEqual([]);
}

type Fixtures = {
  monitor: MonitoredIssues;
};

export const test = base.extend<Fixtures>({
  monitor: async ({ page }, use) => {
    const issues = monitorPage(page);
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture callback
    await use(issues);
  },
});
