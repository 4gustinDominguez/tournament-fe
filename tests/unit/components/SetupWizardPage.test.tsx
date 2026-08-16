import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SetupWizardPage from "@/app/[locale]/manage/setup-wizard/page";

const generateScenarioMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: () => ({
    generateScenario: generateScenarioMock,
  }),
}));

vi.mock("@/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/notify", () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

beforeEach(() => {
  generateScenarioMock.mockReset();
  pushMock.mockReset();
});

describe("SetupWizardPage", () => {
  it("shows mode selection screen initially", () => {
    render(<SetupWizardPage />);

    expect(screen.getByText("Wizard.modeRandomTitle")).toBeInTheDocument();
    expect(screen.getByText("Wizard.modeGuidedTitle")).toBeInTheDocument();
  });

  it("navigates to random mode when Quick card is clicked", async () => {
    const user = userEvent.setup();
    render(<SetupWizardPage />);

    await user.click(screen.getByText("Wizard.modeRandomTitle"));

    expect(screen.getByPlaceholderText("Wizard.tournamentNamePlaceholder")).toBeInTheDocument();
    expect(screen.getByText("Wizard.next")).toBeInTheDocument();
  });

  it("navigates to guided mode when Guided card is clicked", async () => {
    const user = userEvent.setup();
    render(<SetupWizardPage />);

    await user.click(screen.getByText("Wizard.modeGuidedTitle"));

    expect(screen.getByPlaceholderText("Wizard.tournamentNamePlaceholder")).toBeInTheDocument();
  });

  it("goes back to mode selection from step 1", async () => {
    const user = userEvent.setup();
    render(<SetupWizardPage />);

    await user.click(screen.getByText("Wizard.modeRandomTitle"));
    expect(screen.getByPlaceholderText("Wizard.tournamentNamePlaceholder")).toBeInTheDocument();

    await user.click(screen.getByText("Wizard.changeMode"));
    expect(screen.getByText("Wizard.modeRandomTitle")).toBeInTheDocument();
  });

  it("generates a random scenario and navigates to the tournament", async () => {
    const user = userEvent.setup();
    generateScenarioMock.mockResolvedValueOnce({ tournamentId: "tid-456" });
    render(<SetupWizardPage />);

    // Select random mode
    await user.click(screen.getByText("Wizard.modeRandomTitle"));

    // Step 1: name and dates
    await user.type(
      screen.getByPlaceholderText("Wizard.tournamentNamePlaceholder"),
      "Liga 2026",
    );
    await user.click(screen.getByText("Wizard.next"));

    // Step 2: config (teams, places, etc.)
    expect(screen.getByText("Wizard.teamsCount")).toBeInTheDocument();
    await user.click(screen.getByText("Wizard.next"));

    // Step 3: summary
    expect(screen.getByText("Wizard.ready")).toBeInTheDocument();
    await user.click(screen.getByText("Wizard.generateNow"));

    expect(generateScenarioMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tournamentName: "Liga 2026",
        mode: "random",
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/t/tid-456");
  });

  it("generates a guided scenario with fewer steps", async () => {
    const user = userEvent.setup();
    generateScenarioMock.mockResolvedValueOnce({ tournamentId: "tid-789" });
    render(<SetupWizardPage />);

    // Select guided mode
    await user.click(screen.getByText("Wizard.modeGuidedTitle"));

    // Step 1: name and dates
    await user.type(
      screen.getByPlaceholderText("Wizard.tournamentNamePlaceholder"),
      "Mi Torneo",
    );
    await user.click(screen.getByText("Wizard.next"));

    // Step 2: teams config + summary
    expect(screen.getByText("Wizard.teamsCount")).toBeInTheDocument();
    expect(screen.getByText("Wizard.guidedSummaryTitle")).toBeInTheDocument();
    await user.click(screen.getByText("Wizard.generateNow"));

    expect(generateScenarioMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tournamentName: "Mi Torneo",
        mode: "guided",
      }),
    );
    expect(pushMock).toHaveBeenCalledWith("/t/tid-789");
  });
});
