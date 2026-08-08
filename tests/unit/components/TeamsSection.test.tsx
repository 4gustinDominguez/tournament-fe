import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TeamsSection from "@/components/TeamsSection";

const useTournamentContextMock = vi.hoisted(() => vi.fn());
const useAuthMock = vi.hoisted(() => vi.fn());
const getTeamsMock = vi.hoisted(() => vi.fn());
const getPlacesMock = vi.hoisted(() => vi.fn());
const getMatchesMock = vi.hoisted(() => vi.fn());
const deleteTeamMock = vi.hoisted(() => vi.fn());

vi.mock("@/sections/tournaments/tournaments-context", () => ({
  useTournamentContext: useTournamentContextMock,
}));

vi.mock("@/sections/tournaments/auth-context", () => ({
  useAuth: useAuthMock,
  UserRole: {
    SUPER_ADMIN: "SUPER_ADMIN",
    TOURNAMENT_ADMIN: "TOURNAMENT_ADMIN",
    REFEREE: "REFEREE",
    PLAYER: "PLAYER",
  },
}));

const teams = [
  { id: "team-a", name: "Alpha FC", tournamentId: "t1", placeId: "place-1", player: [] },
  { id: "team-b", name: "Beta SC", tournamentId: "t1", player: [] },
];
const places = [{ id: "place-1", name: "Estadio Central", tournamentId: "t1" }];
const tournaments = [
  { id: "t1", name: "Torneo A", ownerId: "user-1", location: "", startDate: "", endDate: "" },
];

const resolveAll = () => {
  getTeamsMock.mockResolvedValue(undefined);
  getPlacesMock.mockResolvedValue(undefined);
  getMatchesMock.mockResolvedValue(undefined);
};

beforeEach(() => {
  getTeamsMock.mockReset();
  getPlacesMock.mockReset();
  getMatchesMock.mockReset();
  deleteTeamMock.mockReset();
  useAuthMock.mockReset();
  useTournamentContextMock.mockReset();
});

describe("TeamsSection", () => {
  it("shows the teams after loading", async () => {
    resolveAll();
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-1", role: "TOURNAMENT_ADMIN" },
    });
    useTournamentContextMock.mockReturnValue({
      getTeams: getTeamsMock,
      teams,
      places,
      getPlaces: getPlacesMock,
      tournaments,
      deleteTeam: deleteTeamMock,
      matches: [],
      getMatches: getMatchesMock,
    });
    render(<TeamsSection tournamentId="t1" />);

    expect(await screen.findByText("Alpha FC")).toBeInTheDocument();
    expect(screen.getByText("Beta SC")).toBeInTheDocument();
    expect(screen.getAllByText("Estadio Central").length).toBeGreaterThan(0);
  });

  it("shows the empty state", async () => {
    resolveAll();
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-1", role: "TOURNAMENT_ADMIN" },
    });
    useTournamentContextMock.mockReturnValue({
      getTeams: getTeamsMock,
      teams: [],
      places,
      getPlaces: getPlacesMock,
      tournaments,
      deleteTeam: deleteTeamMock,
      matches: [],
      getMatches: getMatchesMock,
    });
    render(<TeamsSection tournamentId="t1" />);

    expect(await screen.findByText("Teams.emptyTitle")).toBeInTheDocument();
  });

  it("deletes a team after confirming", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    resolveAll();
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-1", role: "TOURNAMENT_ADMIN" },
    });
    deleteTeamMock.mockResolvedValueOnce(undefined);
    useTournamentContextMock.mockReturnValue({
      getTeams: getTeamsMock,
      teams,
      places,
      getPlaces: getPlacesMock,
      tournaments,
      deleteTeam: deleteTeamMock,
      matches: [],
      getMatches: getMatchesMock,
    });
    render(<TeamsSection tournamentId="t1" />);

    await screen.findByText("Alpha FC");
    await user.click(screen.getAllByRole("button", { name: "Common.delete" })[0]);

    expect(confirmSpy).toHaveBeenCalledWith("Teams.deleteConfirm");
    expect(deleteTeamMock).toHaveBeenCalledWith({
      teamId: "team-a",
      tournamentId: "t1",
    });
  });

  it("does not offer management controls in read-only mode", async () => {
    resolveAll();
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-1", role: "TOURNAMENT_ADMIN" },
    });
    useTournamentContextMock.mockReturnValue({
      getTeams: getTeamsMock,
      teams,
      places,
      getPlaces: getPlacesMock,
      tournaments,
      deleteTeam: deleteTeamMock,
      matches: [],
      getMatches: getMatchesMock,
    });
    render(<TeamsSection tournamentId="t1" readOnly />);

    expect(await screen.findByText("Alpha FC")).toBeInTheDocument();
    expect(screen.queryByText("Teams.enrollNew")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Common.delete" })).not.toBeInTheDocument();
  });
});
