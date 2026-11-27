import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const API_BASE_URL = "http://localhost:3002";
const password = "12345678";

interface Session {
  token: string;
  user: { id: string; email: string };
}

interface RefereeProfile {
  id: string;
  name: string;
  tournamentIds: string[];
  userId?: string;
  email?: string;
}

interface MatchRecord {
  id: string;
  status: string;
  result: { scoreA: number; scoreB: number } | null;
  incidents: Array<{ id: string; type: string }>;
}

function monitorPage(page: Page) {
  const pageErrors: string[] = [];
  const httpErrors: string[] = [];

  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 500) {
      httpErrors.push(`HTTP ${response.status()} ${response.url()}`);
    }
  });

  return { pageErrors, httpErrors };
}

async function postJson<T>(
  request: APIRequestContext,
  path: string,
  data: unknown,
  token?: string,
): Promise<T> {
  const response = await request.post(`${API_BASE_URL}${path}`, {
    data,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok()) {
    throw new Error(`POST ${path} failed (${response.status()}): ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

async function putJson<T>(
  request: APIRequestContext,
  path: string,
  data: unknown,
  token: string,
): Promise<T> {
  const response = await request.put(`${API_BASE_URL}${path}`, {
    data,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok()) {
    throw new Error(`PUT ${path} failed (${response.status()}): ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

async function registerAndLogin(
  request: APIRequestContext,
  email: string,
  role: "TOURNAMENT_ADMIN" | "REFEREE",
): Promise<Session> {
  await postJson(request, "/auth/register", {
    email,
    password,
    firstName: "E2E",
    lastName: role === "REFEREE" ? "Referee" : "Organizer",
    role,
    locale: "es",
  });

  return postJson(request, "/auth/login", { email, password });
}

test("referee registers, controls an assigned match, and is denied an unassigned one", async ({
  page,
  request,
}) => {
  const issues = monitorPage(page);
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const admin = await registerAndLogin(request, `e2e-admin-${suffix}@test.com`, "TOURNAMENT_ADMIN");
  const startDate = new Date().toISOString().slice(0, 10);
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const tournament = await postJson<{ id: string }>(
    request,
    "/tournaments",
    {
      name: `Referee E2E ${suffix}`,
      location: "E2E ground",
      startDate,
      endDate,
    },
    admin.token,
  );
  const teamA = await postJson<{ id: string }>(
    request,
    "/teams",
    { name: `E2E Home ${suffix}`, playerIds: [], tournamentId: tournament.id },
    admin.token,
  );
  const teamB = await postJson<{ id: string }>(
    request,
    "/teams",
    { name: `E2E Away ${suffix}`, playerIds: [], tournamentId: tournament.id },
    admin.token,
  );
  const playerA = await postJson<{ id: string; statistics: { goals: number } }>(
    request,
    "/players",
    { name: `E2E Player A ${suffix}`, nickname: `A${suffix}`, teamId: teamA.id },
    admin.token,
  );
  const playerB = await postJson<{ id: string; statistics: { yellowCards: number } }>(
    request,
    "/players",
    { name: `E2E Player B ${suffix}`, nickname: `B${suffix}`, teamId: teamB.id },
    admin.token,
  );

  const refereeEmail = `e2e-referee-${suffix}@test.com`;
  await page.goto("/register");
  await page.locator('input[name="firstName"]').fill("E2E");
  await page.locator('input[name="lastName"]').fill("Referee");
  await page.locator('input[name="email"]').fill(refereeEmail);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('select[name="role"]').selectOption("REFEREE");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/login/);

  const refereesResponse = await request.get(`${API_BASE_URL}/referees/all`, {
    headers: { Authorization: `Bearer ${admin.token}` },
  });
  expect(refereesResponse.ok()).toBeTruthy();
  const referees = (await refereesResponse.json()) as RefereeProfile[];
  const referee = referees.find((profile) => profile.email === refereeEmail);
  expect(referee, "registered referee should be identifiable by email").toBeDefined();
  if (!referee) throw new Error("Registered referee profile not found");

  await putJson(
    request,
    `/referees/${referee.id}`,
    {
      name: "E2E Referee",
      tournamentIds: [tournament.id],
      userId: referee.userId,
    },
    admin.token,
  );

  const round = await postJson<{ id: string }>(
    request,
    `/tournaments/${tournament.id}/rounds`,
    { name: "E2E Round", startDate: new Date().toISOString() },
    admin.token,
  );
  const matchDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const match = await postJson<{ id: string }>(
    request,
    `/rounds/${round.id}/matches`,
    {
      teamAId: teamA.id,
      teamBId: teamB.id,
      date: matchDate,
      refereeId: referee.id,
    },
    admin.token,
  );

  const unassigned = await registerAndLogin(
    request,
    `e2e-unassigned-${suffix}@test.com`,
    "REFEREE",
  );
  const deniedUpdate = await request.put(`${API_BASE_URL}/matches/${match.id}`, {
    headers: { Authorization: `Bearer ${unassigned.token}` },
    data: { result: { scoreA: 9, scoreB: 0 } },
  });
  expect(deniedUpdate.status()).toBe(403);

  await page.locator("#email").fill(refereeEmail);
  await page.locator("#password").fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/manage\/referee/);
  await expect(page.getByText(/bienvenido/i)).toBeVisible();
  await expect(page.getByText(new RegExp(`E2E Home ${suffix} vs E2E Away ${suffix}`))).toBeVisible();

  await page.getByRole("button", { name: /iniciar partido/i }).click();
  await page.waitForURL(/\/manage\/referee\/match\//);
  await expect(
    page.getByRole("heading", {
      name: new RegExp(`E2E Home ${suffix} vs E2E Away ${suffix}`),
      level: 1,
    }),
  ).toBeVisible();
  const startUpdateResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/matches/${match.id}`) &&
      response.request().method() === "PUT",
  );
  await page.getByRole("button", { name: /iniciar partido/i }).click();
  const startResponse = await startUpdateResponse;
  expect(startResponse.status(), await startResponse.text()).toBe(200);
  await expect(page.getByRole("button", { name: /pausar/i })).toBeVisible();

  const scoreInputs = page.locator('input[type="number"]');
  await scoreInputs.nth(0).fill("1");
  await scoreInputs.nth(1).fill("0");
  await page.getByRole("button", { name: /guardar resultado/i }).click();
  await expect(page.getByRole("button", { name: /pausar/i })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: /pausar/i })).toBeVisible();

  const incidentSelects = page.locator("select");
  await incidentSelects.nth(0).selectOption(teamA.id);
  await incidentSelects.nth(1).selectOption("GOAL");
  await incidentSelects.nth(2).selectOption(playerA.id);
  await page.locator('input[min="1"][max="120"]').fill("12");
  const addGoalResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/matches/${match.id}/incidents`) &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: /agregar evento/i }).click();
  expect((await addGoalResponse).status()).toBe(200);
  await expect(
    page.getByRole("row").filter({ hasText: `E2E Player A ${suffix}` }),
  ).toBeVisible();

  await page.getByRole("button", { name: /finalizar partido/i }).click();
  await expect(page.getByText("Finalizado", { exact: true })).toBeVisible();

  const completedMatch = (await (
    await request.get(`${API_BASE_URL}/matches/${match.id}`)
  ).json()) as MatchRecord;
  expect(completedMatch.status).toBe("completed");
  expect(completedMatch.result).toEqual({ scoreA: 1, scoreB: 0 });
  expect(completedMatch.incidents).toHaveLength(1);

  const playerAAfterMatch = await (
    await request.get(`${API_BASE_URL}/players/${playerA.id}`)
  ).json();
  expect(playerAAfterMatch.statistics.goals).toBe(1);

  await incidentSelects.nth(0).selectOption(teamB.id);
  await incidentSelects.nth(1).selectOption("YELLOW_CARD");
  await incidentSelects.nth(2).selectOption(playerB.id);
  await page.locator('input[min="1"][max="120"]').fill("20");
  const addCardResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/matches/${match.id}/incidents`) &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: /agregar evento/i }).click();
  expect((await addCardResponse).status()).toBe(200);

  const playerBAfterCard = await (
    await request.get(`${API_BASE_URL}/players/${playerB.id}`)
  ).json();
  expect(playerBAfterCard.statistics.yellowCards).toBe(1);

  const deleteIncidentResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/matches/${match.id}/incidents/`) &&
      response.request().method() === "DELETE",
  );
  await page
    .getByRole("row")
    .filter({ hasText: `E2E Player B ${suffix}` })
    .getByRole("button")
    .click();
  expect((await deleteIncidentResponse).status()).toBe(200);
  const playerBAfterCorrection = await (
    await request.get(`${API_BASE_URL}/players/${playerB.id}`)
  ).json();
  expect(playerBAfterCorrection.statistics.yellowCards).toBe(0);

  expect(issues.pageErrors, issues.pageErrors.join("\n")).toEqual([]);
  expect(issues.httpErrors, issues.httpErrors.join("\n")).toEqual([]);
});
