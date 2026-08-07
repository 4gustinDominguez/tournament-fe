import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreateTeamForm from "@/components/CreateTeamForm";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const createTeamMock = vi.hoisted(() => vi.fn());
const getPlacesMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

const places = [
  { id: "place-1", name: "Estadio Central", tournamentId: "t1" },
  { id: "place-2", name: "Polideportivo", tournamentId: "t1" },
];

const tournaments = [{ id: "t1", name: "Torneo A", location: "", startDate: "", endDate: "" }];

beforeEach(() => {
  createTeamMock.mockReset();
  getPlacesMock.mockReset();
  useTournamentContextMock.mockReset();
  useTournamentContextMock.mockReturnValue({
    tournaments,
    places,
    getPlaces: getPlacesMock,
    createTeam: createTeamMock,
  });
});

describe("CreateTeamForm", () => {
  it("loads the places of the tournament on mount", () => {
    render(<CreateTeamForm tournamentId="t1" />);
    expect(getPlacesMock).toHaveBeenCalledWith("t1");
  });

  it("shows the venues as selectable options", () => {
    render(<CreateTeamForm tournamentId="t1" />);
    expect(screen.getByText("Estadio Central")).toBeInTheDocument();
    expect(screen.getByText("Polideportivo")).toBeInTheDocument();
  });

  it("creates the team within the given tournament", async () => {
    const user = userEvent.setup();
    createTeamMock.mockResolvedValueOnce(undefined);
    render(<CreateTeamForm tournamentId="t1" />);

    await user.type(
      screen.getByPlaceholderText("CreateTeamForm.namePlaceholder"),
      "Los Rayos",
    );
    await user.click(screen.getByRole("button", { name: "CreateTeamForm.submit" }));

    expect(createTeamMock).toHaveBeenCalledTimes(1);
    const { tournamentId, team } = createTeamMock.mock.calls[0][0];
    expect(tournamentId).toBe("t1");
    expect(team).toEqual(
      expect.objectContaining({ name: "Los Rayos", tournaments: ["t1"] }),
    );
  });

  it("alerts when no tournament can be resolved", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<CreateTeamForm />);

    await user.type(
      screen.getByPlaceholderText("CreateTeamForm.namePlaceholder"),
      "Equipo suelto",
    );
    await user.click(screen.getByRole("button", { name: "CreateTeamForm.submit" }));

    expect(alertSpy).toHaveBeenCalledWith("CreateTeamForm.selectTournamentAlert");
    expect(createTeamMock).not.toHaveBeenCalled();
  });
});
