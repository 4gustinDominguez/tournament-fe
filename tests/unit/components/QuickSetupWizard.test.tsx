import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import QuickSetupWizard from "@/components/QuickSetupWizard";
import { notify } from "@/lib/notify";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const generateScenarioMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
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
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({
    generateScenario: generateScenarioMock,
  });
  vi.mocked(notify.success).mockClear();
  vi.mocked(notify.error).mockClear();
});

describe("QuickSetupWizard", () => {
  it("disables the next button until a name is typed", async () => {
    const user = userEvent.setup();
    render(<QuickSetupWizard onClose={() => {}} />);

    const nextButton = screen.getByRole("button", { name: "Wizard.next" });
    expect(nextButton).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText("Wizard.tournamentNamePlaceholder"),
      "Copa 2026",
    );
    expect(nextButton).toBeEnabled();
  });

  it("navigates through the steps", async () => {
    const user = userEvent.setup();
    render(<QuickSetupWizard onClose={() => {}} />);

    await user.type(
      screen.getByPlaceholderText("Wizard.tournamentNamePlaceholder"),
      "Copa 2026",
    );
    await user.click(screen.getByRole("button", { name: "Wizard.next" }));

    expect(screen.getByText("Wizard.teamsCount")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Wizard.next" }));

    expect(screen.getByText("Wizard.ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wizard.generateNow" })).toBeInTheDocument();
  });

  it("goes back to the previous step", async () => {
    const user = userEvent.setup();
    render(<QuickSetupWizard onClose={() => {}} />);

    await user.type(
      screen.getByPlaceholderText("Wizard.tournamentNamePlaceholder"),
      "Copa 2026",
    );
    await user.click(screen.getByRole("button", { name: "Wizard.next" }));
    await user.click(screen.getByRole("button", { name: "Wizard.back" }));

    expect(
      screen.getByPlaceholderText("Wizard.tournamentNamePlaceholder"),
    ).toBeInTheDocument();
  });

  it("generates the scenario and navigates to the tournament", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    generateScenarioMock.mockResolvedValueOnce({ tournamentId: "tid-123", tournament: { slug: "test-tournament" } });
    render(<QuickSetupWizard onClose={onClose} />);

    await user.type(
      screen.getByPlaceholderText("Wizard.tournamentNamePlaceholder"),
      "Copa 2026",
    );
    await user.click(screen.getByRole("button", { name: "Wizard.next" }));
    await user.click(screen.getByRole("button", { name: "Wizard.next" }));
    await user.click(screen.getByRole("button", { name: "Wizard.generateNow" }));

    expect(generateScenarioMock).toHaveBeenCalledTimes(1);
    const payload = generateScenarioMock.mock.calls[0][0];
    expect(payload).toEqual(
      expect.objectContaining({
        tournamentName: "Copa 2026",
        teamsCount: 8,
        playersPerTeam: 12,
        placesCount: 2,
        refereesCount: 2,
      }),
    );
    expect(onClose).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/t/test-tournament");
  });

  it("shows an error toast when generation fails", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    generateScenarioMock.mockRejectedValueOnce(new Error("boom"));
    render(<QuickSetupWizard onClose={() => {}} />);

    await user.type(
      screen.getByPlaceholderText("Wizard.tournamentNamePlaceholder"),
      "Copa 2026",
    );
    await user.click(screen.getByRole("button", { name: "Wizard.next" }));
    await user.click(screen.getByRole("button", { name: "Wizard.next" }));
    await user.click(screen.getByRole("button", { name: "Wizard.generateNow" }));

    expect(notify.error).toHaveBeenCalledWith("boom");
    expect(errorSpy).toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
